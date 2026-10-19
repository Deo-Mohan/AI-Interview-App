import { MentorProfile } from '../types/engine';

export const MENTORS: Record<'female' | 'male', MentorProfile> = {
  female: {
    id: 'sophia',
    name: 'Sophia',
    gender: 'female',
    role: 'Executive English & Fluency Coach',
    tagline: 'Warm, patient, and focused on natural idiomatic flow and pronunciation.',
    voiceName: 'Sophia (Clear & Encouraging)',
    modelUrl: '/models/realistic-female.glb',
    accentColor: '#8B5CF6', // Violet
    tags: ['Fluency', 'Pronunciation', 'Confidence', 'Everyday English']
  },
  male: {
    id: 'marcus',
    name: 'Marcus',
    gender: 'male',
    role: 'Technical & Career Interview Specialist',
    tagline: 'Articulate, structured, and focused on STAR answers and executive presence.',
    voiceName: 'Marcus (Articulate & Confident)',
    modelUrl: '/models/realistic-male.glb',
    accentColor: '#3563F5', // Cobalt Blue
    tags: ['Tech Mock', 'STAR Method', 'Executive Presence', 'Negotiation']
  }
};

export const DEFAULT_MENTOR_GENDER: 'female' | 'male' = 'female';
