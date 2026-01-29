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
            <h2 className="text-2xl font-bold text-white">Personal Information</h2>
            <div className="grid grid-cols-1 gap-6">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="University Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                {applicationType === 'no_interview' && (
                    <Input label="Zewail City ID" name="zcid" value={formData.zcid} onChange={handleChange} required />
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Major" name="major" value={formData.major} onChange={handleChange} required>
                        <option value="">Select Major</option>
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
                        <option value="">Select Year</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                    </Select>
                </div>
                {applicationType === 'no_interview' && (
                    <Input label="LinkedIn / Portfolio" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Team Preference</h2>
            <p className="text-slate-400">Select up to 2 teams you're interested in.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Technical', 'Marketing & Media', 'PR & Events', 'HR', 'Finance'].map(team => (
                    <label key={team} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${formData.team.includes(team) ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                        <input
                            type="checkbox"
                            value={team}
                            checked={formData.team.includes(team)}
                            onChange={handleTeamSelection}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500 bg-slate-900 border-slate-600"
                        />
                        <span className="ml-3 text-white font-medium">{team}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Technical Questions</h2>
            {formData.team.includes('Technical') ? (
                <div className="space-y-6">
                    <Select label="Area of Interest" name="technical_interest" value={formData.technical_interest} onChange={handleChange}>
                        <option>Aerodynamics</option>
                        <option>Propulsion</option>
                        <option>CAD & Design</option>
                        <option>Controls</option>
                        <option>Space Systems</option>
                        <option>Other</option>
                    </Select>
                    <Input label="Software Experience (SolidWorks, MATLAB, etc.)" name="technical_software" value={formData.technical_software} onChange={handleChange} />
                    <Select label="Previous Technical Projects?" name="technical_projects" value={formData.technical_projects} onChange={handleChange}>
                        <option>Yes</option>
                        <option>No</option>
                    </Select>
                    <TextArea label="Describe a technical challenge you enjoyed solving." name="technical_challenge" value={formData.technical_challenge} onChange={handleChange} />
                    <TextArea label="What do you hope to gain from the technical team?" name="technical_gain" value={formData.technical_gain} onChange={handleChange} />
                </div>
            ) : (
                <p className="text-slate-400">No specific questions for your selected teams. Click Next to proceed.</p>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Motivation & Availability</h2>
            <div className="space-y-6">
                <Select label="Hours per week available" name="availability" value={formData.availability} onChange={handleChange} required>
                    <option>2–4</option>
                    <option>5–8</option>
                    <option>9+</option>
                </Select>
                <Select label="Can attend biweekly meetings?" name="meetings" value={formData.meetings} onChange={handleChange} required>
                    <option>Yes</option>
                    <option>No</option>
                </Select>
                <Input label="Other major commitments?" name="commitments" value={formData.commitments} onChange={handleChange} />
                <TextArea label="Why do you want to join AIAA Zewail?" name="motivation_join" value={formData.motivation_join} onChange={handleChange} required />
                <TextArea label="What do you hope to achieve?" name="motivation_achieve" value={formData.motivation_achieve} onChange={handleChange} required />
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Final Review</h2>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                <p><strong className="text-slate-300">Name:</strong> <span className="text-white">{formData.name}</span></p>
                <p><strong className="text-slate-300">Major:</strong> <span className="text-white">{formData.major}</span></p>
                <p><strong className="text-slate-300">Teams:</strong> <span className="text-white">{formData.team.join(', ')}</span></p>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload CV (Optional)</label>
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500" />
            </div>
            <label className="flex items-center p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <input type="checkbox" required className="w-5 h-5 text-blue-500 rounded bg-slate-900 border-slate-600" />
                <span className="ml-3 text-slate-300">I confirm that all information provided is accurate.</span>
            </label>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-800 shadow-2xl">
            {/* Progress Bar */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10"></div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
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
                        <button type="button" onClick={prevStep} className="px-6 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">
                            Back
                        </button>
                    ) : <div></div>}
                    {step < 5 ? (
                        <button type="button" onClick={nextStep} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors">
                            Next
                        </button>
                    ) : (
                        <button type="submit" className="px-8 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20">
                            Submit Application
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
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input {...props} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
    </div>
);

const Select = ({ label, children, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <select {...props} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            {children}
        </select>
    </div>
);

const TextArea = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <textarea {...props} rows={4} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
    </div>
);
