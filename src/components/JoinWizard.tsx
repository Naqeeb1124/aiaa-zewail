import React, { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function JoinWizard({ onSubmit, applicationType }: { onSubmit: (data: any) => void, applicationType?: string }) {
    const [step, setStep] = useState(1);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        major: '',
        year: '',
        linkedin: '',
        zcid: '',
        team: [] as string[],
        technical_interest: 'Aerodynamics',
        technical_software: '',
        technical_projects: 'No',
        technical_challenge: '',
        technical_gain: '',
        availability: '2–4',
        meetings: 'Yes',
        commitments: '',
        motivation_join: '',
        motivation_achieve: '',
        cv: null as File | null,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                const fetchUserInfo = async () => {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setFormData(prev => ({
                            ...prev,
                            name: userData.name || user.displayName || '',
                            email: userData.email || user.email || '',
                            phone: userData.phone || '',
                            major: userData.major || '',
                            year: userData.year || '',
                            linkedin: userData.linkedin || '',
                            zcid: userData.studentId || '',
                        }));
                    }
                };
                fetchUserInfo();
            }
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, cv: e.target.files[0] });
        }
    };

    const handleTeamSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const team = e.target.value;
        const currentTeams = formData.team;
        if (currentTeams.includes(team)) {
            setFormData({ ...formData, team: currentTeams.filter(t => t !== team) });
        } else if (currentTeams.length < 2) {
            setFormData({ ...formData, team: [...currentTeams, team] });
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">The basics</h2>
            <p className="text-ink-muted">
                Pulled straight from your Google account. We use it to route the application to the right sub-team lead.
            </p>
            <div className="grid grid-cols-1 gap-6">
                <Input label="Full name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="University email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Phone number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                {applicationType === 'no_interview' && (
                    <Input label="Zewail City ID" name="zcid" value={formData.zcid} onChange={handleChange} required />
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Major" name="major" value={formData.major} onChange={handleChange} required>
                        <option value="">Pick your major</option>
                        <optgroup label="Engineering">
                            <option>Aerospace Engineering</option>
                            <option>Communications & Info Eng.</option>
                            <option>Environmental Eng.</option>
                            <option>Nanotech Eng.</option>
                            <option>Renewable Energy Eng.</option>
                        </optgroup>
                        <optgroup label="CSAI">
                            <option>Software Development</option>
                            <option>Data Science & AI</option>
                            <option>IT</option>
                        </optgroup>
                        <optgroup label="Science">
                            <option>Biomedical Sciences</option>
                            <option>Nanoscience</option>
                            <option>Physics of Universe</option>
                        </optgroup>
                    </Select>
                    <Select label="Year" name="year" value={formData.year} onChange={handleChange} required>
                        <option value="">Pick a year</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                    </Select>
                </div>
                {applicationType === 'no_interview' && (
                    <Input label="LinkedIn or portfolio link" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Where you want to plug in</h2>
            <p className="text-ink-muted">
                Pick up to two. You can change your mind after the interview too.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Technical', 'Marketing & Media', 'PR & Events', 'HR', 'Finance'].map(team => (
                    <label key={team} className={`flex items-center p-4 border cursor-pointer transition-all ${formData.team.includes(team) ? 'bg-sea/20 border-sea' : 'bg-ink border-ink hover:border-ink-soft'}`}>
                        <input
                            type="checkbox"
                            value={team}
                            checked={formData.team.includes(team)}
                            onChange={handleTeamSelection}
                            className="w-5 h-5 text-sea focus:ring-sea bg-ink border-ink-soft"
                        />
                        <span className="ml-3 text-white font-medium">{team}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Technical questions</h2>
            {formData.team.includes('Technical') ? (
                <div className="space-y-6">
                    <Select label="Area you want to focus on" name="technical_interest" value={formData.technical_interest} onChange={handleChange}>
                        <option>Aerodynamics</option>
                        <option>Propulsion</option>
                        <option>CAD & Design</option>
                        <option>Controls</option>
                        <option>Space Systems</option>
                        <option>Other</option>
                    </Select>
                    <Input label="Software you have used (SolidWorks, MATLAB, anything)" name="technical_software" value={formData.technical_software} onChange={handleChange} />
                    <Select label="Built anything aerospace before?" name="technical_projects" value={formData.technical_projects} onChange={handleChange}>
                        <option>Yes</option>
                        <option>No</option>
                    </Select>
                    <TextArea label="Tell us about a technical problem you enjoyed solving." name="technical_challenge" value={formData.technical_challenge} onChange={handleChange} />
                    <TextArea label="What do you want out of the technical team?" name="technical_gain" value={formData.technical_gain} onChange={handleChange} />
                </div>
            ) : (
                <p className="text-ink-muted">
                    Nothing here for your picks. Skip ahead.
                </p>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Time and goals</h2>
            <div className="space-y-6">
                <Select label="Hours per week you can give" name="availability" value={formData.availability} onChange={handleChange} required>
                    <option>2 to 4</option>
                    <option>5 to 8</option>
                    <option>9 or more</option>
                </Select>
                <Select label="Biweekly meetings" name="meetings" value={formData.meetings} onChange={handleChange} required>
                    <option>Yes, I can</option>
                    <option>No, I cannot</option>
                </Select>
                <Input label="Anything else competing for your time?" name="commitments" value={formData.commitments} onChange={handleChange} />
                <TextArea label="Why this branch, specifically?" name="motivation_join" value={formData.motivation_join} onChange={handleChange} required />
                <TextArea label="What do you want to leave behind?" name="motivation_achieve" value={formData.motivation_achieve} onChange={handleChange} required />
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Last look</h2>
            <p className="text-ink-muted">
                Glance through, then send it. Most of this stays editable from your dashboard later.
            </p>
            <div className="bg-ink/50 p-6 border border-ink space-y-4">
                <p><strong className="text-ink-muted">Name:</strong> <span className="text-white">{formData.name}</span></p>
                <p><strong className="text-ink-muted">Major:</strong> <span className="text-white">{formData.major}</span></p>
                <p><strong className="text-ink-muted">Teams:</strong> <span className="text-white">{formData.team.join(', ')}</span></p>
            </div>
            <div>
                <label className="block text-sm font-medium text-ink-muted mb-2">CV file (optional)</label>
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sea file:text-white hover:file:bg-sea" />
            </div>
            <label className="flex items-center p-4 bg-ink/30 border border-ink">
                <input type="checkbox" required className="w-5 h-5 text-sea bg-ink border-ink-soft" />
                <span className="ml-3 text-ink-muted">
                    What I wrote is true to the best of my knowledge.
                </span>
            </label>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-ink p-8 border border-ink">
            {/* Progress Bar */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-ink -z-10"></div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-8 h-8 flex items-center justify-center font-bold text-sm transition-colors ${step >= i ? 'bg-sea text-white' : 'bg-ink text-ink-soft'}`}>
                        {i}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                <div className="mt-8 flex justify-between">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="px-6 py-2 border border-ink-soft text-ink-muted hover:bg-ink transition-colors">
                            Back
                        </button>
                    ) : <div></div>}
                    {step < 5 ? (
                        <button type="button" onClick={nextStep} className="px-6 py-2 bg-sea text-white font-bold hover:bg-sea transition-colors">
                            Next
                        </button>
                    ) : (
                        <button type="submit" className="px-8 py-2 bg-growth text-white font-bold hover:bg-signal-soft transition-colors">
                            Send my application
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

// Helper Components
const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-ink-muted mb-1">{label}</label>
        <input {...props} className="w-full px-4 py-2 bg-ink border border-ink text-white focus:ring-2 focus:ring-sea focus:border-transparent outline-none transition-all" />
    </div>
);

const Select = ({ label, children, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-ink-muted mb-1">{label}</label>
        <select {...props} className="w-full px-4 py-2 bg-ink border border-ink text-white focus:ring-2 focus:ring-sea focus:border-transparent outline-none transition-all">
            {children}
        </select>
    </div>
);

const TextArea = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-ink-muted mb-1">{label}</label>
        <textarea {...props} rows={4} className="w-full px-4 py-2 bg-ink border border-ink text-white focus:ring-2 focus:ring-sea focus:border-transparent outline-none transition-all" />
    </div>
);
