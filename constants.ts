
import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'en', name: 'English (US)', flag: '🇺🇸', nativeName: 'English', description: 'Global business and communication.' },
  { id: 'en-gb', name: 'English (UK)', flag: '🇬🇧', nativeName: 'British English', description: 'The original accent and sophisticated vocabulary.' },
  { id: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano', description: 'Musicality, art, and Mediterranean passion.' },
  { id: 'ro', name: 'Romanian', flag: '🇷🇴', nativeName: 'Română', description: 'The hidden gem of the Romance languages.' },
  { id: 'he', name: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית', description: 'Ancient history meeting modern innovation.' },
  { id: 'yi', name: 'Yiddish', flag: '📖', nativeName: 'ייִדיש', description: 'The rich heritage of Ashkenazi culture.' },
  { id: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी', description: 'The vibrant heart of the Indian subcontinent.' },
  { id: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français', description: 'Diplomacy, art, and romance.' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español', description: 'Connect with over 500 million speakers.' },
  { id: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch', description: 'The language of science and engineering.' },
  { id: 'zh', name: 'Mandarin', flag: '🇨🇳', nativeName: '普通话', description: 'The fastest-growing business language.' },
  { id: 'id', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia', description: 'Gateway to Southeast Asia.' },
  { id: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska', description: 'Innovation and Scandinavian culture.' },
  { id: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский', description: 'Rich literature and global influence.' },
  { id: 'pl', name: 'Polish', flag: '🇵🇱', nativeName: 'Polski', description: 'Vibrant culture and central European history.' },
  { id: 'xh', name: 'Xhosa', flag: '🇿🇦', nativeName: 'isiXhosa', description: 'The beautiful click language of South Africa.' },
  { id: 'ar-lb', name: 'Lebanese Arabic', flag: '🇱🇧', nativeName: 'لهجة لبنانية', description: 'The melodic Levantine dialect.' },
  { id: 'uk', name: 'Ukrainian', flag: '🇺🇦', nativeName: 'Українська', description: 'Resilient and melodic language of Eastern Europe.' },
  { id: 'sjn', name: 'Sindarin', flag: '🧝', nativeName: 'Ethelion', description: 'The noble Elvish language of Middle-earth.' },
  { id: 'dth', name: 'Dothraki', flag: '🐎', nativeName: 'Lekh Dothraki', description: 'The fierce language of the horse lords.' },
];

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Fluency'];

export const COLORS = {
  primary: '#059669', // Emerald 600
  secondary: '#F59E0B', // Amber 500
  accent: '#10B981', // Emerald 500
  background: '#F8FAFC', // Slate 50
  glass: 'rgba(255, 255, 255, 0.7)',
};
