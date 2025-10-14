// Spectrum cards organized by theme
// Each theme has 15-30 cards for varied gameplay

export const themes = {
  popculture: {
    emoji: '🎬',
    name: 'Pop Cultuur',
    cards: [
      ["Slechte acteur", "Goede acteur"],
      ["Slechte muziek", "Goede muziek"],
      ["Slechtste levende persoon", "Grootste levende persoon"],
      ["Onderschat", "Overschat"],
      ["Geliefd", "Gehaat"],
      ["Onbekend", "Beroemd"],
      ["De 'light side of the Force'", "De 'dark side of the Force'"],
      ["Fantasie", "Sci-Fi"],
      ["Slechtste atleet ooit", "Grootste atleet aller tijden"],
      ["Komedie", "Drama"],
      ["Trieste film", "Blije film"],
      ["Triest lied", "Blij lied"],
      ["Star Wars", "Star Trek"],
      ["Griffioen", "Zwadderich"],
      ["Schurk", "Held"],
      ["Vriend", "Vijand"],
      ["Onderbetaald", "Overbetaald"],
      ["Mainstream", "Niche"],
      ["Mode", "Klassiek"]
    ]
  },
  
  privacy: {
    emoji: '🔒',
    name: 'Privacy & Data',
    cards: [
      ["Onbelangrijk data", "Gevoelige data"],
      ["Publiek", "Privé"],
      ["Transparant", "Verborgen"],
      ["Open source", "Proprietary"],
      ["Geen tracking", "Volledige tracking"],
      ["Anoniem", "Geïdentificeerd"],
      ["Vrijwillig delen", "Verplicht delen"],
      ["Lokaal opgeslagen", "Cloud opgeslagen"],
      ["Versleuteld", "Onversleuteld"],
      ["Minimale data", "Maximale data"],
      ["Opt-in", "Opt-out"],
      ["Korte bewaartermijn", "Lange bewaartermijn"],
      ["Gebruiker heeft controle", "Platform heeft controle"],
      ["Privacy-vriendelijk", "Surveillance"],
      ["GDPR compliant", "GDPR violations"],
      ["Geen data delen", "Data verkopen"],
      ["Transparante policy", "Onduidelijke policy"],
      ["Data minimalisatie", "Data maximalisatie"]
    ]
  },
  
  ai: {
    emoji: '🤖',
    name: 'AI & Technologie',
    cards: [
      ["Menselijke intelligentie", "Kunstmatige intelligentie"],
      ["Handmatig proces", "Geautomatiseerd proces"],
      ["Analoog", "Digitaal"],
      ["Oude technologie", "Nieuwe technologie"],
      ["Simpel algoritme", "Complex AI model"],
      ["Menselijke beslissing", "AI beslissing"],
      ["Voorspelbaar", "Machine learning"],
      ["Regelgebaseerd", "Data-gedreven"],
      ["Transparant algoritme", "Black box AI"],
      ["Narrow AI", "General AI"],
      ["AI assistent", "AI vervanger"],
      ["Ethische AI", "Problematische AI"],
      ["Bias-vrij", "Biased algoritme"],
      ["Explainable AI", "Onverklaarbare AI"],
      ["AI voor goed", "AI voor kwaad"],
      ["Gedecentraliseerd", "Gecentraliseerd"],
      ["Open protocol", "Gesloten systeem"],
      ["Low-tech oplossing", "High-tech oplossing"]
    ]
  },
  
  food: {
    emoji: '🍕',
    name: 'Eten & Drinken',
    cards: [
      ["Ethisch om te eten", "Onethisch om te eten"],
      ["Beter heet", "Beter koud"],
      ["Romantisch eten", "Nette eten"],
      ["Smaakt slecht", "Smaakt goed"],
      ["Ruikt slecht", "Ruikt goed"],
      ["Snack", "Maaltijd"],
      ["Droog voedsel", "Nat voedsel"],
      ["Lage calorie", "Hoge calorie"],
      ["Ongezond", "Gezond"],
      ["Slechte pizzatopping", "Goede pizzatopping"],
      ["Vieze combinatie", "Lekkere combinatie"],
      ["Zoet", "Hartig"],
      ["Rauw", "Gaar"],
      ["Vegan", "Vlees"],
      ["Fastfood", "Fine dining"],
      ["Ontbijt", "Diner"],
      ["Geen sandwich", "Een sandwich"],
      ["Acquired taste", "Direct lekker"]
    ]
  },
  
  work: {
    emoji: '💼',
    name: 'Werk & Carrière',
    cards: [
      ["Baan", "Carrière"],
      ["Gevaarlijke baan", "Veilige baan"],
      ["Onderbetaald", "Overbetaald"],
      ["Fysiek werk", "Kantoorwerk"],
      ["Creatief werk", "Analytisch werk"],
      ["Solo werk", "Teamwork"],
      ["Flexibel", "Strict"],
      ["Remote werk", "Kantoor werk"],
      ["Startup", "Corporate"],
      ["Passie", "Salaris"],
      ["Innovatie", "Stabiliteit"],
      ["Risico nemen", "Zekerheid"],
      ["Autonomie", "Hiërarchie"],
      ["Werk-leven balans", "Workaholism"],
      ["Betekenisvol werk", "Zinloos werk"],
      ["Groei potentieel", "Doodlopend"],
      ["Entry level", "Senior niveau"]
    ]
  },
  
  sports: {
    emoji: '🏃',
    name: 'Sport & Fitness',
    cards: [
      ["Mentale activiteit", "Fysieke activiteit"],
      ["Sport", "Spel"],
      ["Individueel", "Team sport"],
      ["Indoor", "Outdoor"],
      ["Kracht", "Uithoudingsvermogen"],
      ["Competitief", "Recreatief"],
      ["Extreme sport", "Veilige sport"],
      ["Zomer sport", "Winter sport"],
      ["Contact sport", "Non-contact"],
      ["Olympische sport", "Niche sport"],
      ["Cardio", "Krachttraining"],
      ["Snelheid", "Precisie"],
      ["Professioneel", "Amateur"],
      ["Spectator sport", "Participant sport"],
      ["Techniek", "Brute kracht"],
      ["Laagdrempelig", "Hoog technisch"],
      ["Goedkope sport", "Dure sport"]
    ]
  },
  
  art: {
    emoji: '🎨',
    name: 'Kunst & Mode',
    cards: [
      ["Niet modieus", "Modieus"],
      ["Gewoon", "Fancy"],
      ["Eenvoudig", "Hipster"],
      ["Lelijk", "Mooi"],
      ["Kitsch", "Klassiek"],
      ["Commercieel", "Artistiek"],
      ["Conform", "Avant-garde"],
      ["Minimalisme", "Maximalisme"],
      ["Functioneel", "Decoratief"],
      ["Massaproductie", "Handgemaakt"],
      ["Tijdloos", "Trendy"],
      ["Casual", "Formeel"],
      ["Subtle", "Opvallend"],
      ["Traditioneel", "Modern"],
      ["Koud", "Warm"],
      ["Symmetrisch", "Asymmetrisch"],
      ["Abstract", "Realistisch"]
    ]
  },
  
  society: {
    emoji: '🌍',
    name: 'Maatschappij & Politiek',
    cards: [
      ["Liberaal", "Conservatief"],
      ["Vrijheidsstrijder", "Terrorist"],
      ["Individualistisch", "Collectivistisch"],
      ["Progressief", "Traditioneel"],
      ["Globalistisch", "Nationalistisch"],
      ["Gelijkheid", "Hiërarchie"],
      ["Vrijheid", "Veiligheid"],
      ["Open grenzen", "Gesloten grenzen"],
      ["Welvaartsstaat", "Vrije markt"],
      ["Regelgeving", "Deregulering"],
      ["Milieu focus", "Economie focus"],
      ["Sociale rechtvaardigheid", "Individuele verantwoordelijkheid"],
      ["Pacifisme", "Militarisme"],
      ["Secularisme", "Religieus"],
      ["Multiculturalisme", "Assimilatie"],
      ["Herverdeling", "Meritocratie"]
    ]
  },
  
  gaming: {
    emoji: '🎮',
    name: 'Gaming & Hobby\'s',
    cards: [
      ["Saaie hobby", "Interessante hobby"],
      ["Tijdverspilling", "Goed gebruik van tijd"],
      ["Casual gaming", "Hardcore gaming"],
      ["Single player", "Multiplayer"],
      ["Mobile game", "Console/PC game"],
      ["Indie game", "AAA game"],
      ["Puzzel game", "Action game"],
      ["Pay to win", "Skill based"],
      ["Story-driven", "Gameplay-driven"],
      ["Competitief", "Coöperatief"],
      ["Retro gaming", "Modern gaming"],
      ["Strategie", "Reflex"],
      ["Sandbox", "Linear"],
      ["PvE", "PvP"],
      ["Casual hobby", "Serious hobby"],
      ["Indoor hobby", "Outdoor hobby"],
      ["Solo activiteit", "Groep activiteit"]
    ]
  },
  
  psychology: {
    emoji: '🧠',
    name: 'Psychologie & Gedrag',
    cards: [
      ["Introvert", "Extravert"],
      ["Slechte gewoonte", "Goede gewoonte"],
      ["Impulsief", "Weloverwogen"],
      ["Emotioneel", "Rationeel"],
      ["Optimistisch", "Pessimistisch"],
      ["Risicomijdend", "Risico zoekend"],
      ["Conformiteit", "Individualiteit"],
      ["Gebrek", "Deugd"],
      ["Egoïstisch", "Altruïstisch"],
      ["Passief", "Actief"],
      ["Vermijding", "Confrontatie"],
      ["Korte termijn denken", "Lange termijn denken"],
      ["Fixed mindset", "Growth mindset"],
      ["Angstgedreven", "Passiegedreven"],
      ["Controlebehoefte", "Loslaten"],
      ["Perfectionist", "Pragmatisch"],
      ["Gemene persoon", "Leuke persoon"]
    ]
  },
  
  daily: {
    emoji: '🏡',
    name: 'Dagelijks Leven',
    cards: [
      ["Ochtendmens", "Avondmens"],
      ["Georganiseerd", "Chaotisch"],
      ["Punctueel", "Altijd te laat"],
      ["Spaarzaam", "Verkwistend"],
      ["Huisdier hebben", "Geen huisdier"],
      ["Kattenmens", "Hondenmens"],
      ["Stad", "Platteland"],
      ["Huren", "Kopen"],
      ["Openbaar vervoer", "Auto"],
      ["Vroeg opstaan", "Uitslapen"],
      ["Koken", "Bezorgen"],
      ["Opruimen", "Rommelig"],
      ["Plannen", "Spontaan"],
      ["Routine", "Variatie"],
      ["Minimalistisch leven", "Veel spullen"],
      ["Doe-het-zelver", "Professional inhuren"],
      ["Offline", "Online leven"]
    ]
  },
  
  philosophy: {
    emoji: '🎭',
    name: 'Filosofie & Ethiek',
    cards: [
      ["Onvergeeflijk", "Vergeeflijk"],
      ["Goed", "Kwaad"],
      ["Moreel relatief", "Absolute moraal"],
      ["Utilistisch", "Deontologisch"],
      ["Determinisme", "Vrije wil"],
      ["Materialisme", "Idealisme"],
      ["Nihilisme", "Existentialisme"],
      ["Egoïsme", "Altruïsme"],
      ["Hedonisme", "Ascetisme"],
      ["Pragmatisme", "Idealisme"],
      ["Skepticisme", "Geloof"],
      ["Objectief", "Subjectief"],
      ["Consequentialisme", "Deontologie"],
      ["Relatief", "Absoluut"],
      ["Seculier", "Spiritueel"],
      ["Rationeel", "Irrationeel"]
    ]
  },
  
  quality: {
    emoji: '⚖️',
    name: 'Quality & Risk',
    cards: [
      ["Slecht ontworpen", "Goed ontworpen"],
      ["Slecht gemaakt", "Goed gemaakt"],
      ["Lage kwaliteit", "Hoge kwaliteit"],
      ["Ineffectief", "Effectief"],
      ["Onbetrouwbaar", "Betrouwbaar"],
      ["Onstabiel", "Stabiel"],
      ["Risicovol", "Risicovrij"],
      ["Non-compliant", "Compliant"],
      ["Reactief", "Proactief"],
      ["Ad-hoc", "Gestructureerd"],
      ["Ongedocumenteerd", "Goed gedocumenteerd"],
      ["Geen governance", "Sterke governance"],
      ["Korte termijn focus", "Lange termijn duurzaamheid"],
      ["Silo's", "Geïntegreerd"],
      ["Legacy systeem", "Modern platform"],
      ["Technische schuld", "Clean code"],
      ["Geen monitoring", "Continue monitoring"],
      ["Handmatig proces", "Geautomatiseerd proces"],
      ["Geen testing", "Uitgebreide testing"],
      ["Vulnerabilities", "Secure by design"],
      ["Data inconsistentie", "Data integriteit"],
      ["Geen backup", "Disaster recovery"],
      ["Vendor lock-in", "Vendor agnostic"],
      ["Slechte user experience", "Excellente user experience"],
      ["Geen compliance", "Audit ready"],
      ["Operationeel risico", "Gecontroleerd risico"]
    ]
  }
};

// Get all theme IDs
export function getThemeIds() {
  return Object.keys(themes);
}

// Get theme info
export function getTheme(themeId) {
  return themes[themeId];
}

// Get cards for a specific theme
export function getCardsByTheme(themeId) {
  const theme = themes[themeId];
  return theme ? theme.cards : [];
}

// Get a random card from a specific theme
export function getRandomCardFromTheme(themeId) {
  const cards = getCardsByTheme(themeId);
  if (cards.length === 0) return null;
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}

// Get card by index from a specific theme
export function getCardByIndexFromTheme(themeId, index, seed = 0) {
  const theme = themes[themeId];
  if (!theme || !theme.cards || theme.cards.length === 0) {
    console.error(`Theme '${themeId}' not found or has no cards`);
    return null;
  }
  
  const cards = theme.cards;
  
  // Create a deterministic but shuffled order based on seed
  // This ensures all players see the same card, but in a random order per game
  const shuffledIndices = cards.map((_, i) => i);
  
  // Fisher-Yates shuffle with seeded random
  let random = seed;
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }
  
  // Get the card at the shuffled position
  const shuffledIndex = shuffledIndices[index % cards.length];
  return cards[shuffledIndex];
}

// Legacy support - get all cards (for backward compatibility)
export const dutchSpectrumCards = Object.values(themes).flatMap(theme => theme.cards);

export function getRandomCard() {
  const index = Math.floor(Math.random() * dutchSpectrumCards.length);
  return dutchSpectrumCards[index];
}

export function getCardByIndex(index) {
  return dutchSpectrumCards[index % dutchSpectrumCards.length];
}
