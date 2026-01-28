import LightRedTemplate from './LightRedTemplate';
import ClassicTraditionalTemplate from './ClassicTraditionalTemplate';
import ModernMinimalTemplate from './ModernMinimalTemplate';
import BlueProfessionalTemplate from './BlueProfessionalTemplate';

export const PRESCRIPTION_TEMPLATES = [
  { id: 'light-red', name: 'Light Red (Default)', component: LightRedTemplate },
  { id: 'classic', name: 'Classic Traditional', component: ClassicTraditionalTemplate },
  { id: 'minimal', name: 'Modern Minimal', component: ModernMinimalTemplate },
  { id: 'blue', name: 'Blue Professional', component: BlueProfessionalTemplate }
];

export const getTemplateById = (id) => {
  return PRESCRIPTION_TEMPLATES.find(t => t.id === id) || PRESCRIPTION_TEMPLATES[0];
};

export {
  LightRedTemplate,
  ClassicTraditionalTemplate,
  ModernMinimalTemplate,
  BlueProfessionalTemplate
};
