const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, trim: true },
  category: { type: String, required: true },
  batchNumber: { type: String },
  expiryDate: { type: Date, required: true },
  stockQuantity: { type: Number, default: 0, min: 0 },
  minimumStock: { type: Number, default: 10 },
  price: { type: Number, default: 0 },
  manufacturer: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);

// Generate random batch number
const generateBatch = () => `BTH${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

// Generate random expiry date (6 months to 3 years from now)
const generateExpiry = () => {
  const months = Math.floor(Math.random() * 30) + 6; // 6 to 36 months
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

// Generate random stock (20-500)
const generateStock = () => Math.floor(Math.random() * 480) + 20;

// Common Indian Medicines Data
const medicines = [
  // TABLETS
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Tablet', price: 15, manufacturer: 'Cipla' },
  { name: 'Paracetamol 650mg', genericName: 'Paracetamol', category: 'Tablet', price: 20, manufacturer: 'Sun Pharma' },
  { name: 'Dolo 650', genericName: 'Paracetamol', category: 'Tablet', price: 30, manufacturer: 'Micro Labs' },
  { name: 'Crocin 500mg', genericName: 'Paracetamol', category: 'Tablet', price: 25, manufacturer: 'GSK' },
  { name: 'Calpol 500mg', genericName: 'Paracetamol', category: 'Tablet', price: 22, manufacturer: 'GSK' },
  { name: 'Combiflam', genericName: 'Ibuprofen + Paracetamol', category: 'Tablet', price: 35, manufacturer: 'Sanofi' },
  { name: 'Brufen 400mg', genericName: 'Ibuprofen', category: 'Tablet', price: 28, manufacturer: 'Abbott' },
  { name: 'Ibuprofen 200mg', genericName: 'Ibuprofen', category: 'Tablet', price: 18, manufacturer: 'Cipla' },
  { name: 'Aspirin 75mg', genericName: 'Aspirin', category: 'Tablet', price: 12, manufacturer: 'Bayer' },
  { name: 'Ecosprin 75mg', genericName: 'Aspirin', category: 'Tablet', price: 15, manufacturer: 'USV' },
  { name: 'Ecosprin 150mg', genericName: 'Aspirin', category: 'Tablet', price: 20, manufacturer: 'USV' },
  { name: 'Disprin', genericName: 'Aspirin', category: 'Tablet', price: 18, manufacturer: 'Reckitt' },
  { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Tablet', price: 25, manufacturer: 'Cipla' },
  { name: 'Allegra 120mg', genericName: 'Fexofenadine', category: 'Tablet', price: 85, manufacturer: 'Sanofi' },
  { name: 'Allegra 180mg', genericName: 'Fexofenadine', category: 'Tablet', price: 120, manufacturer: 'Sanofi' },
  { name: 'Montair LC', genericName: 'Montelukast + Levocetirizine', category: 'Tablet', price: 145, manufacturer: 'Cipla' },
  { name: 'Montek LC', genericName: 'Montelukast + Levocetirizine', category: 'Tablet', price: 135, manufacturer: 'Sun Pharma' },
  { name: 'Levocet 5mg', genericName: 'Levocetirizine', category: 'Tablet', price: 45, manufacturer: 'Sun Pharma' },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Tablet', price: 95, manufacturer: 'Cipla' },
  { name: 'Azee 500', genericName: 'Azithromycin', category: 'Tablet', price: 105, manufacturer: 'Cipla' },
  { name: 'Zithromax 250mg', genericName: 'Azithromycin', category: 'Tablet', price: 85, manufacturer: 'Pfizer' },
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Tablet', price: 65, manufacturer: 'Cipla' },
  { name: 'Mox 500', genericName: 'Amoxicillin', category: 'Tablet', price: 72, manufacturer: 'Ranbaxy' },
  { name: 'Augmentin 625', genericName: 'Amoxicillin + Clavulanic Acid', category: 'Tablet', price: 185, manufacturer: 'GSK' },
  { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Tablet', price: 55, manufacturer: 'Cipla' },
  { name: 'Ciplox 500', genericName: 'Ciprofloxacin', category: 'Tablet', price: 62, manufacturer: 'Cipla' },
  { name: 'Norflox 400', genericName: 'Norfloxacin', category: 'Tablet', price: 48, manufacturer: 'Cipla' },
  { name: 'Ofloxacin 200mg', genericName: 'Ofloxacin', category: 'Tablet', price: 52, manufacturer: 'Cipla' },
  { name: 'Metronidazole 400mg', genericName: 'Metronidazole', category: 'Tablet', price: 35, manufacturer: 'Abbott' },
  { name: 'Flagyl 400', genericName: 'Metronidazole', category: 'Tablet', price: 42, manufacturer: 'Abbott' },
  { name: 'Ornidazole 500mg', genericName: 'Ornidazole', category: 'Tablet', price: 55, manufacturer: 'Sun Pharma' },
  { name: 'Pan 40', genericName: 'Pantoprazole', category: 'Tablet', price: 85, manufacturer: 'Alkem' },
  { name: 'Pantop 40', genericName: 'Pantoprazole', category: 'Tablet', price: 78, manufacturer: 'Aristo' },
  { name: 'Pantocid 40', genericName: 'Pantoprazole', category: 'Tablet', price: 92, manufacturer: 'Sun Pharma' },
  { name: 'Omez 20', genericName: 'Omeprazole', category: 'Tablet', price: 65, manufacturer: 'Dr Reddy' },
  { name: 'Rabeprazole 20mg', genericName: 'Rabeprazole', category: 'Tablet', price: 75, manufacturer: 'Cipla' },
  { name: 'Razo 20', genericName: 'Rabeprazole', category: 'Tablet', price: 82, manufacturer: 'Dr Reddy' },
  { name: 'Domperidone 10mg', genericName: 'Domperidone', category: 'Tablet', price: 28, manufacturer: 'Cipla' },
  { name: 'Domstal 10', genericName: 'Domperidone', category: 'Tablet', price: 32, manufacturer: 'Torrent' },
  { name: 'Ondansetron 4mg', genericName: 'Ondansetron', category: 'Tablet', price: 45, manufacturer: 'Sun Pharma' },
  { name: 'Emeset 4', genericName: 'Ondansetron', category: 'Tablet', price: 52, manufacturer: 'Cipla' },
  { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Tablet', price: 25, manufacturer: 'USV' },
  { name: 'Glycomet 500', genericName: 'Metformin', category: 'Tablet', price: 32, manufacturer: 'USV' },
  { name: 'Metformin 850mg', genericName: 'Metformin', category: 'Tablet', price: 35, manufacturer: 'Cipla' },
  { name: 'Glimepiride 1mg', genericName: 'Glimepiride', category: 'Tablet', price: 45, manufacturer: 'Sanofi' },
  { name: 'Glimepiride 2mg', genericName: 'Glimepiride', category: 'Tablet', price: 55, manufacturer: 'Sanofi' },
  { name: 'Amaryl 1mg', genericName: 'Glimepiride', category: 'Tablet', price: 65, manufacturer: 'Sanofi' },
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Tablet', price: 35, manufacturer: 'Cipla' },
  { name: 'Amlodipine 10mg', genericName: 'Amlodipine', category: 'Tablet', price: 45, manufacturer: 'Cipla' },
  { name: 'Stamlo 5', genericName: 'Amlodipine', category: 'Tablet', price: 42, manufacturer: 'Dr Reddy' },
  { name: 'Atenolol 50mg', genericName: 'Atenolol', category: 'Tablet', price: 28, manufacturer: 'Cipla' },
  { name: 'Metoprolol 25mg', genericName: 'Metoprolol', category: 'Tablet', price: 32, manufacturer: 'Cipla' },
  { name: 'Metoprolol 50mg', genericName: 'Metoprolol', category: 'Tablet', price: 42, manufacturer: 'Sun Pharma' },
  { name: 'Losartan 50mg', genericName: 'Losartan', category: 'Tablet', price: 55, manufacturer: 'Cipla' },
  { name: 'Telmisartan 40mg', genericName: 'Telmisartan', category: 'Tablet', price: 65, manufacturer: 'Glenmark' },
  { name: 'Telma 40', genericName: 'Telmisartan', category: 'Tablet', price: 72, manufacturer: 'Glenmark' },
  { name: 'Ramipril 5mg', genericName: 'Ramipril', category: 'Tablet', price: 48, manufacturer: 'Sanofi' },
  { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Tablet', price: 85, manufacturer: 'Cipla' },
  { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin', category: 'Tablet', price: 125, manufacturer: 'Cipla' },
  { name: 'Atorva 10', genericName: 'Atorvastatin', category: 'Tablet', price: 95, manufacturer: 'Zydus' },
  { name: 'Rosuvastatin 10mg', genericName: 'Rosuvastatin', category: 'Tablet', price: 145, manufacturer: 'Sun Pharma' },
  { name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', category: 'Tablet', price: 75, manufacturer: 'Sun Pharma' },
  { name: 'Clopilet 75', genericName: 'Clopidogrel', category: 'Tablet', price: 82, manufacturer: 'Sun Pharma' },
  { name: 'Prednisolone 5mg', genericName: 'Prednisolone', category: 'Tablet', price: 25, manufacturer: 'Cipla' },
  { name: 'Prednisolone 10mg', genericName: 'Prednisolone', category: 'Tablet', price: 35, manufacturer: 'Cipla' },
  { name: 'Wysolone 10', genericName: 'Prednisolone', category: 'Tablet', price: 38, manufacturer: 'Pfizer' },
  { name: 'Deflazacort 6mg', genericName: 'Deflazacort', category: 'Tablet', price: 85, manufacturer: 'Cipla' },
  { name: 'Diclofenac 50mg', genericName: 'Diclofenac', category: 'Tablet', price: 22, manufacturer: 'Novartis' },
  { name: 'Voveran 50', genericName: 'Diclofenac', category: 'Tablet', price: 28, manufacturer: 'Novartis' },
  { name: 'Aceclofenac 100mg', genericName: 'Aceclofenac', category: 'Tablet', price: 35, manufacturer: 'Ipca' },
  { name: 'Zerodol SP', genericName: 'Aceclofenac + Serratiopeptidase', category: 'Tablet', price: 95, manufacturer: 'Ipca' },
  { name: 'Tramadol 50mg', genericName: 'Tramadol', category: 'Tablet', price: 45, manufacturer: 'Intas' },
  { name: 'Gabapentin 300mg', genericName: 'Gabapentin', category: 'Tablet', price: 125, manufacturer: 'Pfizer' },
  { name: 'Pregabalin 75mg', genericName: 'Pregabalin', category: 'Tablet', price: 145, manufacturer: 'Pfizer' },
  { name: 'Vitamin B Complex', genericName: 'Vitamin B Complex', category: 'Tablet', price: 35, manufacturer: 'Abbott' },
  { name: 'Becosules', genericName: 'Vitamin B Complex', category: 'Tablet', price: 42, manufacturer: 'Pfizer' },
  { name: 'Neurobion Forte', genericName: 'Vitamin B1, B6, B12', category: 'Tablet', price: 65, manufacturer: 'Merck' },
  { name: 'Calcium + Vitamin D3', genericName: 'Calcium + Vitamin D3', category: 'Tablet', price: 85, manufacturer: 'Abbott' },
  { name: 'Shelcal 500', genericName: 'Calcium + Vitamin D3', category: 'Tablet', price: 95, manufacturer: 'Torrent' },
  { name: 'Limcee 500mg', genericName: 'Vitamin C', category: 'Tablet', price: 25, manufacturer: 'Abbott' },
  { name: 'Celin 500', genericName: 'Vitamin C', category: 'Tablet', price: 22, manufacturer: 'GSK' },
  { name: 'Folic Acid 5mg', genericName: 'Folic Acid', category: 'Tablet', price: 15, manufacturer: 'Alkem' },
  { name: 'Iron + Folic Acid', genericName: 'Ferrous Sulphate + Folic Acid', category: 'Tablet', price: 28, manufacturer: 'Abbott' },
  { name: 'Livogen', genericName: 'Ferrous Fumarate + Folic Acid', category: 'Tablet', price: 45, manufacturer: 'Merck' },
  { name: 'Multivitamin', genericName: 'Multivitamin', category: 'Tablet', price: 55, manufacturer: 'Abbott' },
  { name: 'Supradyn', genericName: 'Multivitamin', category: 'Tablet', price: 85, manufacturer: 'Bayer' },
  { name: 'Zincovit', genericName: 'Multivitamin + Zinc', category: 'Tablet', price: 95, manufacturer: 'Apex' },

  // CAPSULES
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Capsule', price: 55, manufacturer: 'Dr Reddy' },
  { name: 'Omez 20 Capsule', genericName: 'Omeprazole', category: 'Capsule', price: 62, manufacturer: 'Dr Reddy' },
  { name: 'Esomeprazole 40mg', genericName: 'Esomeprazole', category: 'Capsule', price: 95, manufacturer: 'AstraZeneca' },
  { name: 'Neksium 40', genericName: 'Esomeprazole', category: 'Capsule', price: 105, manufacturer: 'AstraZeneca' },
  { name: 'Lansoprazole 30mg', genericName: 'Lansoprazole', category: 'Capsule', price: 75, manufacturer: 'Cipla' },
  { name: 'Amoxicillin 250mg Cap', genericName: 'Amoxicillin', category: 'Capsule', price: 45, manufacturer: 'Ranbaxy' },
  { name: 'Ampicillin 500mg', genericName: 'Ampicillin', category: 'Capsule', price: 52, manufacturer: 'Ranbaxy' },
  { name: 'Doxycycline 100mg', genericName: 'Doxycycline', category: 'Capsule', price: 65, manufacturer: 'Sun Pharma' },
  { name: 'Clindamycin 300mg', genericName: 'Clindamycin', category: 'Capsule', price: 125, manufacturer: 'Cipla' },
  { name: 'Cephalexin 500mg', genericName: 'Cephalexin', category: 'Capsule', price: 85, manufacturer: 'GSK' },
  { name: 'Itraconazole 100mg', genericName: 'Itraconazole', category: 'Capsule', price: 185, manufacturer: 'Cipla' },
  { name: 'Fluconazole 150mg', genericName: 'Fluconazole', category: 'Capsule', price: 65, manufacturer: 'Pfizer' },
  { name: 'Rifaximin 550mg', genericName: 'Rifaximin', category: 'Capsule', price: 225, manufacturer: 'Sun Pharma' },
  { name: 'Vitamin E 400mg', genericName: 'Vitamin E', category: 'Capsule', price: 95, manufacturer: 'Merck' },
  { name: 'Evion 400', genericName: 'Vitamin E', category: 'Capsule', price: 85, manufacturer: 'Merck' },
  { name: 'Fish Oil Omega 3', genericName: 'Omega 3 Fatty Acids', category: 'Capsule', price: 145, manufacturer: 'HealthKart' },
  { name: 'Cod Liver Oil', genericName: 'Cod Liver Oil', category: 'Capsule', price: 125, manufacturer: 'Seven Seas' },

  // SYRUPS
  { name: 'Benadryl Cough Syrup', genericName: 'Diphenhydramine', category: 'Syrup', price: 85, manufacturer: 'Johnson' },
  { name: 'Corex Cough Syrup', genericName: 'Chlorpheniramine', category: 'Syrup', price: 95, manufacturer: 'Pfizer' },
  { name: 'Grilinctus Syrup', genericName: 'Dextromethorphan', category: 'Syrup', price: 75, manufacturer: 'Franco Indian' },
  { name: 'Ascoril LS', genericName: 'Ambroxol + Levosalbutamol', category: 'Syrup', price: 115, manufacturer: 'Glenmark' },
  { name: 'Chericof Syrup', genericName: 'Dextromethorphan + CPM', category: 'Syrup', price: 65, manufacturer: 'Sun Pharma' },
  { name: 'Alex Syrup', genericName: 'Phenylephrine + CPM', category: 'Syrup', price: 72, manufacturer: 'Glenmark' },
  { name: 'Zedex Syrup', genericName: 'Dextromethorphan', category: 'Syrup', price: 68, manufacturer: 'Wockhardt' },
  { name: 'Ambrodil S', genericName: 'Ambroxol + Salbutamol', category: 'Syrup', price: 85, manufacturer: 'Aristo' },
  { name: 'Mucinac Syrup', genericName: 'Acetylcysteine', category: 'Syrup', price: 95, manufacturer: 'Cipla' },
  { name: 'Sinarest Syrup', genericName: 'Paracetamol + Phenylephrine', category: 'Syrup', price: 55, manufacturer: 'Centaur' },
  { name: 'Digene Syrup', genericName: 'Antacid', category: 'Syrup', price: 85, manufacturer: 'Abbott' },
  { name: 'Gelusil MPS', genericName: 'Antacid', category: 'Syrup', price: 78, manufacturer: 'Pfizer' },
  { name: 'Mucaine Gel', genericName: 'Oxetacaine + Antacid', category: 'Syrup', price: 125, manufacturer: 'Pfizer' },
  { name: 'Cremaffin Syrup', genericName: 'Liquid Paraffin', category: 'Syrup', price: 135, manufacturer: 'Abbott' },
  { name: 'Duphalac Syrup', genericName: 'Lactulose', category: 'Syrup', price: 185, manufacturer: 'Abbott' },
  { name: 'Practin Syrup', genericName: 'Cyproheptadine', category: 'Syrup', price: 65, manufacturer: 'Alkem' },
  { name: 'Liv 52 Syrup', genericName: 'Herbal Hepatoprotective', category: 'Syrup', price: 145, manufacturer: 'Himalaya' },
  { name: 'Alkasol Syrup', genericName: 'Disodium Hydrogen Citrate', category: 'Syrup', price: 95, manufacturer: 'Stadmed' },
  { name: 'Potklor Syrup', genericName: 'Potassium Chloride', category: 'Syrup', price: 85, manufacturer: 'Alkem' },
  { name: 'Oflomac M Syrup', genericName: 'Ofloxacin + Metronidazole', category: 'Syrup', price: 95, manufacturer: 'Macleods' },

  // INJECTIONS
  { name: 'Insulin Regular', genericName: 'Insulin Human', category: 'Injection', price: 285, manufacturer: 'Novo Nordisk' },
  { name: 'Insulin NPH', genericName: 'Insulin Isophane', category: 'Injection', price: 295, manufacturer: 'Novo Nordisk' },
  { name: 'Ceftriaxone 1g', genericName: 'Ceftriaxone', category: 'Injection', price: 85, manufacturer: 'Cipla' },
  { name: 'Amikacin 500mg', genericName: 'Amikacin', category: 'Injection', price: 65, manufacturer: 'Cipla' },
  { name: 'Gentamicin 80mg', genericName: 'Gentamicin', category: 'Injection', price: 25, manufacturer: 'Alkem' },
  { name: 'Ranitidine Inj', genericName: 'Ranitidine', category: 'Injection', price: 18, manufacturer: 'GSK' },
  { name: 'Pantoprazole Inj', genericName: 'Pantoprazole', category: 'Injection', price: 85, manufacturer: 'Sun Pharma' },
  { name: 'Ondansetron Inj', genericName: 'Ondansetron', category: 'Injection', price: 35, manufacturer: 'Cipla' },
  { name: 'Dexamethasone Inj', genericName: 'Dexamethasone', category: 'Injection', price: 28, manufacturer: 'Zydus' },
  { name: 'Diclofenac Inj', genericName: 'Diclofenac', category: 'Injection', price: 22, manufacturer: 'Novartis' },

  // CREAMS & OINTMENTS
  { name: 'Betadine Ointment', genericName: 'Povidone Iodine', category: 'Ointment', price: 65, manufacturer: 'Win Medicare' },
  { name: 'Soframycin Cream', genericName: 'Framycetin', category: 'Cream', price: 55, manufacturer: 'Sanofi' },
  { name: 'Neosporin Ointment', genericName: 'Neomycin + Bacitracin', category: 'Ointment', price: 72, manufacturer: 'Pfizer' },
  { name: 'Candid Cream', genericName: 'Clotrimazole', category: 'Cream', price: 85, manufacturer: 'Glenmark' },
  { name: 'Clotrimazole Cream', genericName: 'Clotrimazole', category: 'Cream', price: 45, manufacturer: 'Cipla' },
  { name: 'Betnovate C', genericName: 'Betamethasone + Clioquinol', category: 'Cream', price: 65, manufacturer: 'GSK' },
  { name: 'Betnovate N', genericName: 'Betamethasone + Neomycin', category: 'Cream', price: 68, manufacturer: 'GSK' },
  { name: 'Panderm Plus', genericName: 'Clobetasol + Miconazole', category: 'Cream', price: 125, manufacturer: 'Macleods' },
  { name: 'Quadriderm Cream', genericName: 'Beclomethasone + Antibiotics', category: 'Cream', price: 145, manufacturer: 'GSK' },
  { name: 'Terbinafine Cream', genericName: 'Terbinafine', category: 'Cream', price: 95, manufacturer: 'Novartis' },
  { name: 'Ketoconazole Cream', genericName: 'Ketoconazole', category: 'Cream', price: 85, manufacturer: 'Cipla' },
  { name: 'Moov Cream', genericName: 'Diclofenac', category: 'Cream', price: 75, manufacturer: 'Reckitt' },
  { name: 'Volini Gel', genericName: 'Diclofenac', category: 'Cream', price: 115, manufacturer: 'Sun Pharma' },
  { name: 'Iodex', genericName: 'Methyl Salicylate', category: 'Ointment', price: 65, manufacturer: 'GSK' },
  { name: 'Burnol Cream', genericName: 'Aminacrine', category: 'Cream', price: 55, manufacturer: 'Dr Morepen' },
  { name: 'Silver Sulfadiazine', genericName: 'Silver Sulfadiazine', category: 'Cream', price: 95, manufacturer: 'Cipla' },

  // EYE/EAR DROPS
  { name: 'Moxifloxacin Eye Drop', genericName: 'Moxifloxacin', category: 'Drops', price: 85, manufacturer: 'Cipla' },
  { name: 'Ciprofloxacin Eye Drop', genericName: 'Ciprofloxacin', category: 'Drops', price: 45, manufacturer: 'Cipla' },
  { name: 'Tobramycin Eye Drop', genericName: 'Tobramycin', category: 'Drops', price: 65, manufacturer: 'Alcon' },
  { name: 'Refresh Tears', genericName: 'Carboxymethylcellulose', category: 'Drops', price: 125, manufacturer: 'Allergan' },
  { name: 'Tears Naturale', genericName: 'Hydroxypropyl Methylcellulose', category: 'Drops', price: 145, manufacturer: 'Alcon' },
  { name: 'Genteal Gel', genericName: 'Hydroxypropyl Methylcellulose', category: 'Drops', price: 185, manufacturer: 'Novartis' },
  { name: 'Prednisolone Eye Drop', genericName: 'Prednisolone', category: 'Drops', price: 55, manufacturer: 'Allergan' },
  { name: 'Tropicamide Eye Drop', genericName: 'Tropicamide', category: 'Drops', price: 35, manufacturer: 'Cipla' },
  { name: 'Timolol Eye Drop', genericName: 'Timolol', category: 'Drops', price: 65, manufacturer: 'Cipla' },
  { name: 'Latanoprost Eye Drop', genericName: 'Latanoprost', category: 'Drops', price: 285, manufacturer: 'Sun Pharma' },
  { name: 'Otrivin Nasal Drops', genericName: 'Xylometazoline', category: 'Drops', price: 55, manufacturer: 'Novartis' },
  { name: 'Nasivion Nasal Drops', genericName: 'Oxymetazoline', category: 'Drops', price: 65, manufacturer: 'Merck' },
  { name: 'Soliwax Ear Drops', genericName: 'Paradichlorobenzene', category: 'Drops', price: 55, manufacturer: 'Cipla' },
  { name: 'Waxolve Ear Drops', genericName: 'Chlorobutanol', category: 'Drops', price: 48, manufacturer: 'Sun Pharma' },

  // INHALERS
  { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Inhaler', price: 125, manufacturer: 'Cipla' },
  { name: 'Asthalin Inhaler', genericName: 'Salbutamol', category: 'Inhaler', price: 135, manufacturer: 'Cipla' },
  { name: 'Levolin Inhaler', genericName: 'Levosalbutamol', category: 'Inhaler', price: 175, manufacturer: 'Cipla' },
  { name: 'Budecort Inhaler', genericName: 'Budesonide', category: 'Inhaler', price: 285, manufacturer: 'Cipla' },
  { name: 'Foracort Inhaler', genericName: 'Formoterol + Budesonide', category: 'Inhaler', price: 385, manufacturer: 'Cipla' },
  { name: 'Seroflo Inhaler', genericName: 'Salmeterol + Fluticasone', category: 'Inhaler', price: 425, manufacturer: 'Cipla' },
  { name: 'Duolin Inhaler', genericName: 'Levosalbutamol + Ipratropium', category: 'Inhaler', price: 195, manufacturer: 'Cipla' },
  { name: 'Tiotropium Inhaler', genericName: 'Tiotropium', category: 'Inhaler', price: 485, manufacturer: 'Cipla' },

  // POWDERS
  { name: 'ORS Powder', genericName: 'Oral Rehydration Salts', category: 'Powder', price: 15, manufacturer: 'Various' },
  { name: 'Electral Powder', genericName: 'Oral Rehydration Salts', category: 'Powder', price: 22, manufacturer: 'FDC' },
  { name: 'Glucon D', genericName: 'Glucose', category: 'Powder', price: 85, manufacturer: 'Heinz' },
  { name: 'Protinex Powder', genericName: 'Protein Supplement', category: 'Powder', price: 485, manufacturer: 'Danone' },
  { name: 'Ensure Powder', genericName: 'Nutritional Supplement', category: 'Powder', price: 685, manufacturer: 'Abbott' },
  { name: 'Isabgol', genericName: 'Psyllium Husk', category: 'Powder', price: 125, manufacturer: 'Sat Isabgol' },
];

async function seedMedicines() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if medicines already exist
    const existingCount = await Medicine.countDocuments();
    if (existingCount > 50) {
      console.log(`Already ${existingCount} medicines in database. Skipping seed.`);
      process.exit(0);
    }

    console.log(`Adding ${medicines.length} medicines...`);

    const medicinesWithFullData = medicines.map(med => ({
      ...med,
      batchNumber: generateBatch(),
      expiryDate: generateExpiry(),
      stockQuantity: generateStock(),
      minimumStock: 10,
      isActive: true
    }));

    await Medicine.insertMany(medicinesWithFullData);

    console.log(`Successfully added ${medicines.length} medicines!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding medicines:', error);
    process.exit(1);
  }
}

seedMedicines();
