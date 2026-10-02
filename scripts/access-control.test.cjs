/**
 * Access-control regression tests.
 *
 * Covers src/lib/config.ts (who is admitted, and under which tier) plus the
 * invariants firestore.rules depends on. The Firestore emulator needs Java,
 * which is not assumed here, so the rules are checked structurally rather than
 * executed. Run with: npm run test:access
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.tmp-verify');
const { classifyEmail, EXTERNAL_DOMAIN_ALLOWLIST } = require(path.join(OUT, 'lib', 'config.js'));
const {
    normalizeFields,
    validateAnswer,
    validateSubmission,
    audienceAllows,
    typeNeedsOptions,
} = require(path.join(OUT, 'lib', 'forms.js'));

const tier = (email) => classifyEmail(email)?.affiliation ?? null;

/** Remove `function name(...) { ... }` definitions, brace-balanced. */
const stripFunctions = (text) => {
    let out = '';
    let i = 0;
    while (i < text.length) {
        const start = text.indexOf('function ', i);
        if (start === -1) {
            out += text.slice(i);
            break;
        }
        out += `${text.slice(i, start)} `;
        let depth = 0;
        let j = text.indexOf('{', start);
        for (; j < text.length; j++) {
            if (text[j] === '{') depth++;
            else if (text[j] === '}') {
                depth--;
                if (depth === 0) {
                    j++;
                    break;
                }
            }
        }
        i = j;
    }
    return out;
};

/**
 * The `allow` statements in a rules block. Functions are stripped first and
 * semicolons are honoured only at the top level, so neither a `;` inside a
 * helper body nor a helper glued to the next rule can break a statement apart.
 */
const allowStatements = (block) => {
    const inner = stripFunctions(block.replace(/^\s*\{/, '').replace(/\}\s*$/, ''));
    const parts = [];
    let depth = 0;
    let current = '';
    for (const ch of inner) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        if (ch === ';' && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }
        current += ch;
    }
    if (current.trim()) parts.push(current);
    return parts
        .map(s => s.replace(/\/\/[^\n]*/g, '').trim())
        .filter(s => /^allow\b/.test(s));
};

/** Find the first `allow` statement granting `kind` (read, create, update, ...). */
const allowRule = (block, kind) =>
    allowStatements(block).find(s => new RegExp(`^allow ${kind}\\b`).test(s));

test('Zewail City students are members', () => {
    assert.equal(tier('s-abdelrahman.alnaqeeb@zewailcity.edu.eg'), 'zewail');
    assert.equal(tier('s-ahmed.hassan@zewailcity.edu.eg'), 'zewail');
    // Casing and surrounding whitespace must not change the verdict.
    assert.equal(tier('  S-Mohamed.Ali@ZewailCity.edu.eg  '), 'zewail');
    assert.equal(classifyEmail('S-X@ZEWAILCITY.EDU.EG').email, 's-x@zewailcity.edu.eg');
});

test('Zewail City staff accounts are external, never members', () => {
    // Same domain, but no s- prefix: faculty and staff never get member access.
    assert.equal(tier('t-abdelrahman.alnaqeeb@zewailcity.edu.eg'), 'external');
    assert.equal(tier('abdelrahman.alnaqeeb@zewailcity.edu.eg'), 'external');
    assert.equal(tier('aiaa@zewailcity.edu.eg'), 'external');
    // Org subdomains are external too.
    assert.equal(tier('outreach@aiaa.zewailcity.edu.eg'), 'external');
});

test('students at other universities are external', () => {
    assert.equal(tier('student@eng.zu.edu.eg'), 'external');
    assert.equal(tier('someone@aucegypt.edu'), 'external'); // AUC's real domain
    assert.equal(tier('someone@cu.edu.eg'), 'external');
    assert.equal(tier('someone@deep.sub.university.edu.eg'), 'external');
});

test('open sign-up admits any well-formed address as external', () => {
    // Sign-up is open while the AUC event runs: addresses outside `.edu.eg`
    // must not be denied.
    assert.equal(tier('someone@gmail.com'), 'external');
    assert.equal(tier('student@aucegypt.edu'), 'external');
    assert.equal(tier('someone@notedu.eg'), 'external');
});

test('only malformed addresses are refused', () => {
    assert.equal(tier('@zewailcity.edu.eg'), null); // no local part
    assert.equal(tier('someone@'), null);
    assert.equal(tier('someone@localhost'), null); // no dotted domain
    assert.equal(tier('not-an-email'), null);
    assert.equal(tier('someone @example.com'), null);
    assert.equal(tier(''), null);
    assert.equal(tier(null), null);
    assert.equal(tier(undefined), null);
});

test('Zewail membership cannot be spoofed with a lookalike domain', () => {
    assert.equal(tier('s-a@zewailcity.edu.eg.evil.com'), 'external');
    assert.equal(tier('s-a@notzewailcity.edu.eg'), 'external');
});

test('Zewail City students are never classified as external', () => {
    for (const email of [
        's-a@zewailcity.edu.eg',
        's-abdelrahman.alnaqeeb@zewailcity.edu.eg',
    ]) {
        assert.equal(
            classifyEmail(email)?.affiliation,
            'zewail',
            `${email} must be a member`
        );
    }
});

test('metadata is derived consistently', () => {
    const z = classifyEmail('s-ahmed@zewailcity.edu.eg');
    assert.equal(z.university, 'Zewail City');
    assert.equal(z.domain, 'zewailcity.edu.eg');

    const e = classifyEmail('student@eng.zu.edu.eg');
    assert.equal(e.university, 'eng.zu.edu.eg');
    assert.equal(e.domain, 'eng.zu.edu.eg');
    assert.equal(e.email, 'student@eng.zu.edu.eg');
});

test('allowlist defaults to open sign-up, and narrows when populated', () => {
    assert.deepEqual(EXTERNAL_DOMAIN_ALLOWLIST, [], 'default must stay open');

    const config = require(path.join(OUT, 'lib', 'config.js'));
    config.EXTERNAL_DOMAIN_ALLOWLIST.push('zu.edu.eg');
    try {
        assert.equal(tier('student@eng.zu.edu.eg'), 'external', 'subdomain of allowlisted parent');
        assert.equal(tier('someone@aucegypt.edu'), null, 'not allowlisted once narrowed');
        assert.equal(tier('someone@gmail.com'), null, 'open sign-up is off once narrowed');
        assert.equal(tier('s-a@zewailcity.edu.eg'), 'zewail', 'members are exempt');
    } finally {
        config.EXTERNAL_DOMAIN_ALLOWLIST.length = 0;
    }
});

// --- firestore.rules invariants -------------------------------------------

const RULES = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');

/**
 * Extract one `match /coll/{id} { ... }` block by brace counting, so an
 * assertion cannot pass by scanning into a later collection. The path variable
 * `{id}` is skipped: the block brace is the first one after it.
 */
const blockFor = (coll) => {
    const head = `match /${coll}/`;
    const start = RULES.indexOf(head);
    if (start === -1) return null;
    const afterPath = RULES.indexOf('}', start + head.length);
    if (afterPath === -1) return null;
    const open = RULES.indexOf('{', afterPath + 1);
    if (open === -1) return null;
    let depth = 0;
    for (let i = open; i < RULES.length; i++) {
        if (RULES[i] === '{') depth++;
        else if (RULES[i] === '}') {
            depth--;
            if (depth === 0) return RULES.slice(open, i + 1);
        }
    }
    return null;
};

test('rules derive the tier from the signed token, not the user document', () => {
    assert.match(RULES, /function isZewail\(\)/);
    assert.match(RULES, /request\.auth\.token\.email/);
    // Reading the tier from users/{uid}.affiliation would be forgeable.
    assert.doesNotMatch(
        RULES,
        /documents\/users\/\$\(request\.auth\.uid\)\)\.data\.affiliation/,
        'rules must not trust the client-writable affiliation field'
    );
});

test('rules use only documented String methods', () => {
    // rules.String defines lower/matches/replace/size/split/toUtf8/trim/upper.
    // startsWith/endsWith/contains are not in the language: the compiler warns
    // "Invalid function name" and evaluation fails closed, silently denying
    // every member action. A whole-string RE2 match is the correct tool.
    assert.doesNotMatch(
        RULES,
        /\.(startsWith|endsWith|contains|toLowerCase|toUpperCase)\s*\(/,
        'unknown String method would fail closed at evaluation'
    );
    assert.match(
        RULES,
        /authEmail\(\)\.matches\("s-\.\*@zewailcity\[\.\]edu\[\.\]eg"\)/,
        'membership must be matched with an escaped dot regex'
    );
});

test('rules restrict exactly role, points and badges', () => {
    const m = RULES.match(
        /function isPrivilegeEscalation\(keys\)\s*\{\s*return keys\.hasAny\(\[([^\]]*)\]\)/
    );
    assert.ok(m, 'isPrivilegeEscalation must exist and use keys.hasAny');
    const fields = m[1]
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    assert.deepEqual(fields.sort(), ['badges', 'points', 'role']);
    // activeFlagship and projectHistory are maintained client-side by
    // src/lib/projects.ts; restricting them would break the flagship rule.
    assert.ok(!fields.includes('activeFlagship'), 'would break the flagship rule');
    assert.ok(!fields.includes('projectHistory'), 'would break the flagship rule');
});

test('membership collections are gated on isZewail()', () => {
    for (const coll of ['applications', 'interviews', 'joinRequests']) {
        const block = blockFor(coll);
        assert.ok(block, `${coll} block must exist`);
        assert.match(block, /isZewail\(\)/, `${coll} must be Zewail-only`);

        // Every access path must route through a tier check.
        const statements = allowStatements(block);
        assert.ok(statements.length, `${coll} must declare access`);
        for (const statement of statements) {
            assert.match(
                statement,
                /isZewail\(\)|isAdmin\(\)/,
                `${coll} access without a tier check: ${statement.replace(/\s+/g, ' ')}`
            );
        }
    }
});

test('event registrations stay open to every signed-in account', () => {
    const block = blockFor('registrations');
    assert.ok(block, 'registrations block must exist');
    assert.match(block, /isVerifiedAccount\(\)/);
    // The external tier must not be locked out of its one real capability.
    assert.doesNotMatch(block, /isZewail\(\)/, 'registrations must not be Zewail-only');
    // A `.edu.eg`-only gate locked out real university accounts like AUC's.
    assert.doesNotMatch(block, /edu\.eg/, 'registrations must not require an Egyptian domain');
});

test('rules file is structurally balanced', () => {
    const open = (RULES.match(/\{/g) || []).length;
    const close = (RULES.match(/\}/g) || []).length;
    assert.equal(open, close, `unbalanced braces: ${open} open, ${close} close`);
});

// --- Dynamic forms: schema handling ---------------------------------------

const f = (over) => ({ id: 'f1', type: 'shortText', label: 'Q', required: false, ...over });

test('normalizeFields drops malformed entries', () => {
    const out = normalizeFields([
        f({ label: 'Keeper' }),
        f({ label: '   ' }),                    // blank label
        f({ type: 'evilType', label: 'Bad' }),  // unknown type
        null,
        'not an object',
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].label, 'Keeper');
});

test('normalizeFields reassigns duplicate and missing field ids', () => {
    const out = normalizeFields([f({ id: 'dup' }), f({ id: 'dup' }), f({ id: '' })]);
    const ids = out.map(x => x.id);
    assert.equal(new Set(ids).size, 3, 'ids must be unique');
    assert.ok(ids.every(Boolean), 'ids must be non-empty');
});

test('normalizeFields only keeps options on choice fields', () => {
    const out = normalizeFields([
        f({ type: 'singleChoice', label: 'Pick', options: ['A', 'B', ''] }),
        f({ type: 'shortText', label: 'Free', options: ['Sneaky'] }),
    ]);
    assert.deepEqual(out[0].options, ['A', 'B']);
    assert.equal(out[1].options, undefined, 'non-choice fields must not carry options');
    assert.equal(typeNeedsOptions('singleChoice'), true);
    assert.equal(typeNeedsOptions('shortText'), false);
});

test('required fields reject empty answers, optional ones do not', () => {
    const required = f({ required: true });
    assert.equal(validateAnswer(required, '').ok, false);
    assert.equal(validateAnswer(required, null).ok, false);
    assert.equal(validateAnswer(required, []).ok, false);
    assert.equal(validateAnswer(required, 'a').ok, true);

    const optional = f({ required: false });
    assert.equal(validateAnswer(optional, '').ok, true);
});

test('number answers reject values Number() would silently coerce', () => {
    const required = f({ type: 'number', required: true });
    const optional = f({ type: 'number' });

    assert.equal(validateAnswer(required, '42').ok, true);
    assert.equal(validateAnswer(required, '-3.5').ok, true);
    assert.deepEqual(validateAnswer(required, '42').value, 42);

    for (const bad of ['12abc', '1,5', 'NaN', 'Infinity', '0x10', '1e5', '$4']) {
        assert.equal(validateAnswer(required, bad).ok, false, `"${bad}" must be rejected`);
        assert.equal(validateAnswer(optional, bad).ok, false, `"${bad}" must be rejected when optional`);
    }

    // A blank answer is only an error when the field is required.
    assert.equal(validateAnswer(required, '').ok, false);
    assert.equal(validateAnswer(required, '   ').ok, false);
    assert.equal(validateAnswer(optional, '').ok, true);
    assert.equal(validateAnswer(optional, null).ok, true);
});

test('choice answers must match the schema options', () => {
    const single = f({ type: 'singleChoice', options: ['Yes', 'No'] });
    assert.equal(validateAnswer(single, 'Yes').ok, true);
    assert.equal(validateAnswer(single, 'Maybe').ok, false, 'invented option must be rejected');
    assert.equal(validateAnswer(single, 'maybe').ok, false, 'matching is case sensitive');

    const multi = f({ type: 'multiChoice', options: ['A', 'B', 'C'] });
    const out = validateAnswer(multi, ['C', 'A', 'A', 'Z']);
    assert.deepEqual(out.value, ['A', 'C'], 'de-duplicated and ordered by the schema');
});

test('text answers are length capped', () => {
    const short = f({ type: 'shortText', required: true });
    assert.equal(validateAnswer(short, 'x'.repeat(201)).ok, false);
    assert.equal(validateAnswer(short, 'x'.repeat(200)).ok, true);

    const long = f({ type: 'longText', required: true });
    assert.equal(validateAnswer(long, 'x'.repeat(4001)).ok, false);
});

test('email and date answers are format checked', () => {
    const email = f({ type: 'email', required: true });
    assert.equal(validateAnswer(email, 'A@Example.COM').value, 'a@example.com');
    assert.equal(validateAnswer(email, 'nope').ok, false);

    const date = f({ type: 'date', required: true });
    assert.equal(validateAnswer(date, '2026-09-28').ok, true);
    assert.equal(validateAnswer(date, '28/09/2026').ok, false);
    assert.equal(validateAnswer(date, '2026-13-45').ok, false);
});

test('validateSubmission ignores answer keys absent from the schema', () => {
    // The submit endpoint trusts only the stored schema, so a crafted body
    // cannot inject extra keys into a stored response.
    const result = validateSubmission([f({ id: 'real' })], {
        real: 'ok',
        injected: 'should not be persisted',
        __proto__: 'nope',
    });
    assert.equal(result.ok, true);
    assert.deepEqual(Object.keys(result.answers), ['real']);
});

test('validateSubmission reports per-field errors', () => {
    const result = validateSubmission(
        [f({ id: 'a', required: true, label: 'Alpha' }), f({ id: 'b', type: 'email', required: true, label: 'Beta' })],
        { b: 'not-an-email' }
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.a.includes('Alpha'));
    assert.ok(result.errors.b.includes('Beta'));
});

test('audienceAllows enforces each audience', () => {
    const zewail = { authenticated: true, affiliation: 'zewail', role: 'member' };
    const external = { authenticated: true, affiliation: 'external', role: null };
    const guest = { authenticated: false, affiliation: null, role: null };

    assert.equal(audienceAllows('public', guest), true);
    assert.equal(audienceAllows('public', zewail), true);

    assert.equal(audienceAllows('university', guest), false);
    assert.equal(audienceAllows('university', external), true);
    assert.equal(audienceAllows('university', zewail), true);

    assert.equal(audienceAllows('zewail', external), false, 'externals are not members');
    assert.equal(audienceAllows('zewail', guest), false);
    assert.equal(audienceAllows('zewail', zewail), true);

    assert.equal(audienceAllows('members', external), false, 'role is what matters, not tier');
    assert.equal(audienceAllows('members', guest), false);
    assert.equal(audienceAllows('members', zewail), true);
    assert.equal(
        audienceAllows('members', { authenticated: true, affiliation: 'external', role: 'admin' }),
        true,
        'admins count as members'
    );
});

// --- Dynamic forms: rules --------------------------------------------------

test('only Zewail students may create forms, and only as themselves', () => {
    const create = allowRule(blockFor('forms'), 'create');
    assert.ok(create, 'forms must declare create access');
    assert.match(create, /isZewail\(\)/, 'form creation must be Zewail-only');
    assert.match(create, /createdBy == request\.auth\.uid/, 'ownership must not be forgeable');
});

test('published forms are publicly readable but drafts are not', () => {
    const read = allowRule(blockFor('forms'), 'read');
    assert.ok(read, 'forms must declare read access');
    assert.match(read, /status == 'published'/, 'public read must be limited to published forms');
    assert.doesNotMatch(read, /if true\s*$/, 'forms must not be world readable');
});

test('responses are never writable by a client', () => {
    // Submissions go through /api/forms/submit with the Admin SDK, so a public
    // form cannot become a spam bucket through the client SDK.
    const create = allowRule(blockFor('responses'), 'create');
    assert.ok(create, 'responses must declare create access');
    assert.match(create, /if false/, 'client response creation must be denied outright');
});

test('responses are readable by admins and owners only', () => {
    const read = allowRule(blockFor('responses'), 'read');
    assert.ok(read, 'responses must declare read access');
    assert.match(read, /isAdmin\(\)/);
    assert.match(read, /isOwner\(\)/);
    assert.doesNotMatch(read, /if true\s*$/, 'responses must never be public');
});

test('owners may triage responses but never rewrite answers', () => {
    const update = allowRule(blockFor('responses'), 'update');
    assert.ok(update, 'responses must declare update access');
    const m = update.match(/hasOnly\(\[([^\]]*)\]\)/);
    assert.ok(m, 'update must be restricted with hasOnly');
    const fields = m[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).sort();
    assert.deepEqual(fields, ['notes', 'reviewedAt', 'reviewedBy', 'status']);
    for (const forbidden of ['answers', 'submitter', 'createdAt']) {
        assert.ok(!fields.includes(forbidden), `${forbidden} must not be reviewable`);
    }
});

test('the rate limit collection has no client access at all', () => {
    const block = blockFor('formRateLimits');
    assert.ok(block, 'formRateLimits block must exist');
    assert.match(block.replace(/\s+/g, ' '), /allow read, write: if false/);
});
