import { normalize } from "./scoring";
import type { Question, TierId } from "./types";
import { practiceBank } from "./questions.practice";
import { themedBank } from "./questions.themed";
import { expansionBank } from "./questions.expansion";

/**
 * Curated bank. Each tier is a "|"-separated list; aliases use "=" (first is display name).
 * Tiers are editorial guesses at commonness — NOT real player statistics.
 */
type Raw = Partial<Record<"p" | "c" | "s" | "r" | "d" | "m", string>>;
const T: Record<keyof Raw, TierId> = { p: "pencil", c: "paperclip", s: "notebook", r: "backpack", d: "goldstar", m: "valedictorian" };

function q(id: string, category: string, prompt: string, raw: Raw): Question {
  const answers = new Map<string, { display: string; tier: TierId }>();
  (Object.keys(raw) as (keyof Raw)[]).forEach((k) => {
    raw[k]?.split("|").forEach((entry) => {
      const names = entry.split("=").map((s) => s.trim()).filter(Boolean);
      const display = names[0];
      if (display) names.forEach((n) => answers.set(normalize(n), { display, tier: T[k] }));
    });
  });
  return { id, category, prompt, answers };
}

/** Core bank: used for daily challenges (order matters for daily seeding). */
export const DAILY_QUESTIONS: Question[] = [
  q("country", "Geography", "Name a country", {
    p: "United States=USA=US=America=United States of America|Canada|China|Japan|France|Germany|Brazil|Mexico|India|Italy|Spain|United Kingdom=UK=Britain=Great Britain|Australia|Russia",
    s: "Argentina|Egypt|Greece|Portugal|Sweden|Norway|Ireland|Netherlands=Holland|South Korea=Korea|Nigeria|Kenya|Peru|Chile|Turkey=Turkiye|Poland|Switzerland|Thailand|Vietnam|Cuba|Colombia|New Zealand|South Africa|Iceland|Denmark|Finland|Belgium|Austria|Israel|Iran|Iraq|Pakistan|Indonesia|Philippines|Saudi Arabia|Ukraine|Jamaica",
    r: "Mongolia|Nepal|Morocco|Ethiopia|Ghana|Croatia|Hungary|Czech Republic=Czechia|Romania|Bolivia|Ecuador|Uruguay|Paraguay|Venezuela|Cambodia|Laos|Malaysia|Singapore|Sri Lanka|Bangladesh|Afghanistan|Syria|Jordan|Lebanon|Qatar|Luxembourg|Monaco|Madagascar|Tanzania|Uganda|Zimbabwe|Senegal|Fiji|Estonia|Latvia|Lithuania|Serbia|Bulgaria|Slovakia|Slovenia|Haiti|Panama|Costa Rica|Honduras|Guatemala|North Korea",
    d: "Bhutan|Eritrea|Djibouti|Moldova|Belarus|Kyrgyzstan|Tajikistan|Turkmenistan|Uzbekistan|Kazakhstan|Azerbaijan|Armenia|Georgia|Andorra|San Marino|Liechtenstein|Malta|Brunei|Myanmar=Burma|Benin|Togo|Burkina Faso|Mali|Niger|Chad|Gabon|Namibia|Botswana|Lesotho|Eswatini=Swaziland|Malawi|Zambia|Rwanda|Burundi|Somalia|Sudan|South Sudan|Oman|Yemen|Kuwait|Bahrain|Suriname|Guyana|Belize|Samoa|Tonga|Albania|North Macedonia=Macedonia|Montenegro|Bosnia and Herzegovina=Bosnia|Cyprus|Mauritius|Maldives",
    m: "Tuvalu|Nauru|Palau|Kiribati|Vanuatu|Comoros|Sao Tome and Principe|Cabo Verde=Cape Verde|Equatorial Guinea|Guinea Bissau|Seychelles|Marshall Islands|Micronesia|Timor Leste=East Timor|Solomon Islands|Saint Kitts and Nevis|Saint Lucia|Dominica|Grenada|Antigua and Barbuda|Vatican City=Vatican=Holy See|Mauritania|Liberia|Sierra Leone|Gambia",
  }),
  q("fruit", "Food", "Name a fruit", {
    p: "Apple|Banana|Orange|Strawberry|Grape|Watermelon|Mango|Pineapple",
    c: "Tomato|Cucumber|Avocado|Pumpkin|Olive|Eggplant|Pepper|Bell Pepper",
    s: "Peach|Pear|Cherry|Blueberry|Raspberry|Kiwi|Lemon|Lime|Plum|Coconut|Grapefruit|Cantaloupe|Blackberry|Pomegranate|Papaya|Apricot|Fig|Nectarine|Honeydew|Cranberry",
    r: "Passion Fruit|Lychee|Dragon Fruit=Pitaya|Guava|Persimmon|Date|Tangerine|Clementine|Mandarin|Starfruit=Carambola|Gooseberry|Kumquat|Quince|Plantain|Elderberry|Boysenberry|Mulberry|Jackfruit",
    d: "Durian|Rambutan|Mangosteen|Longan|Loquat|Feijoa|Soursop=Guanabana|Tamarind|Ackee|Cherimoya|Physalis|Pawpaw|Sapodilla|Yuzu|Salak=Snake Fruit|Lingonberry|Cloudberry|Medlar",
    m: "Jabuticaba|Miracle Fruit=Miracle Berry|Buddhas Hand|Mamey Sapote=Mamey|Rambai|Langsat|Santol|Marula|Cupuacu|Ugli Fruit|Horned Melon=Kiwano|Bilimbi|Pulasan|Salmonberry",
  }),
  q("planet", "Space", "Name a planet or dwarf planet", {
    p: "Earth|Mars|Jupiter|Saturn",
    s: "Venus|Mercury|Neptune|Uranus",
    c: "Pluto",
    d: "Ceres|Eris",
    m: "Haumea|Makemake",
  }),
  q("dog", "Animals", "Name a dog breed", {
    p: "Golden Retriever|Labrador=Labrador Retriever=Lab|German Shepherd|Poodle|Bulldog|Chihuahua|Pug|Husky=Siberian Husky",
    s: "Beagle|Dachshund|Rottweiler|Boxer|Corgi|Shih Tzu|Pomeranian|Yorkshire Terrier=Yorkie|Great Dane|Dalmatian|Border Collie|Doberman|Pit Bull|French Bulldog|Maltese|Cocker Spaniel|Australian Shepherd|Greyhound",
    r: "Bernese Mountain Dog|Saint Bernard|Shiba Inu|Akita|Basset Hound|Bloodhound|Chow Chow|Samoyed|Newfoundland|Whippet|Weimaraner|Vizsla|Schnauzer|Bichon Frise|Jack Russell Terrier|Cavalier King Charles Spaniel|Mastiff|Papillon|Shar Pei|Malamute=Alaskan Malamute",
    d: "Basenji|Borzoi|Afghan Hound|Puli|Komondor|Saluki|Rhodesian Ridgeback|Leonberger|Bedlington Terrier|Xoloitzcuintli=Xolo|Keeshond|Briard|Schipperke|Pharaoh Hound|Shiba|Lhasa Apso|Tibetan Mastiff",
    m: "Lagotto Romagnolo|Otterhound|Norwegian Lundehund|Azawakh|Catahoula|Mudi|Stabyhoun|Kooikerhondje|Sloughi|Thai Ridgeback|Dandie Dinmont Terrier|Bergamasco|Kai Ken|Peruvian Inca Orchid",
  }),
  q("pixar", "Movies", "Name a Pixar film", {
    p: "Toy Story|Finding Nemo|Cars|Up|The Incredibles=Incredibles|Inside Out|Monsters Inc",
    s: "Ratatouille|Wall E=WallE|Coco|Toy Story 2|Toy Story 3|A Bugs Life|Brave|Finding Dory|Monsters University|Soul",
    r: "Toy Story 4|Incredibles 2|Cars 2|Cars 3|Luca|Turning Red|Onward|Elemental|Inside Out 2",
    d: "The Good Dinosaur=Good Dinosaur|Lightyear",
    m: "Elio",
  }),
  q("element", "Science", "Name a chemical element", {
    p: "Oxygen|Hydrogen|Carbon|Gold|Iron|Helium|Nitrogen|Silver",
    s: "Sodium|Calcium|Copper|Zinc|Lead|Aluminum=Aluminium|Uranium|Neon|Mercury|Chlorine|Potassium|Magnesium|Sulfur=Sulphur|Platinum|Silicon|Lithium|Tin|Nickel|Phosphorus|Iodine|Fluorine",
    r: "Argon|Titanium|Plutonium|Radon|Cobalt|Chromium|Tungsten|Krypton|Xenon|Boron|Bromine|Manganese|Arsenic|Radium|Barium|Beryllium|Cesium=Caesium|Palladium|Selenium",
    d: "Gallium|Germanium|Strontium|Zirconium|Molybdenum|Bismuth|Antimony|Cadmium|Indium|Iridium|Osmium|Vanadium|Thorium|Polonium|Francium|Scandium|Rubidium|Tellurium|Neodymium|Americium|Einsteinium",
    m: "Hafnium|Rhenium|Ruthenium|Rhodium|Niobium|Tantalum|Praseodymium|Promethium|Samarium|Europium|Gadolinium|Terbium|Dysprosium|Holmium|Erbium|Thulium|Ytterbium|Lutetium|Yttrium|Technetium|Protactinium|Neptunium|Curium|Berkelium|Californium|Fermium|Mendelevium|Nobelium|Lawrencium|Rutherfordium|Dubnium|Seaborgium|Bohrium|Hassium|Meitnerium|Darmstadtium|Roentgenium|Copernicium|Nihonium|Flerovium|Moscovium|Livermorium|Tennessine|Oganesson|Astatine|Actinium|Lanthanum|Cerium|Thallium",
  }),
  q("beatles", "Music", "Name a Beatles song", {
    p: "Hey Jude|Let It Be|Yesterday|Come Together|Here Comes the Sun|Yellow Submarine",
    s: "Help|Twist and Shout|Something|Blackbird|In My Life|Penny Lane|Strawberry Fields Forever|All You Need Is Love|A Hard Days Night|Eleanor Rigby|I Want to Hold Your Hand|Love Me Do|Lucy in the Sky with Diamonds|Get Back|Let It Be",
    r: "Ticket to Ride|Revolution|Michelle|While My Guitar Gently Weeps|Ob La Di Ob La Da|Norwegian Wood|Day Tripper|Paperback Writer|She Loves You|Can't Buy Me Love=Cant Buy Me Love|A Day in the Life|With a Little Help from My Friends|Drive My Car|The Long and Winding Road=Long and Winding Road|Across the Universe|Helter Skelter",
    d: "Rocky Raccoon|Dear Prudence|Taxman|Golden Slumbers|I Am the Walrus|Nowhere Man|Got to Get You into My Life|Back in the USSR|Here There and Everywhere|Tomorrow Never Knows|Octopuss Garden|Octopus's Garden|Maxwells Silver Hammer|Sgt Peppers Lonely Hearts Club Band|Happiness Is a Warm Gun|Two of Us",
    m: "Wild Honey Pie|Savoy Truffle|Mr Moonlight|Dig a Pony|Long Long Long|The Inner Light|Flying|Doctor Robert|Run for Your Life|Hey Bulldog|Only a Northern Song|Glass Onion|Mean Mr Mustard|Polythene Pam|Her Majesty|Revolution 9|Piggies",
  }),
  q("superhero", "Comics", "Name a superhero", {
    p: "Superman|Batman|Spider Man=Spiderman|Wonder Woman|Iron Man|Captain America|Hulk|Thor",
    s: "Black Panther|Wolverine|Flash|Aquaman|Green Lantern|Black Widow|Deadpool|Captain Marvel|Doctor Strange|Ant Man|Hawkeye|Cyclops|Storm|Robin|Supergirl|Scarlet Witch|Shazam",
    r: "Daredevil|Green Arrow|Cyborg|Silver Surfer|Batgirl|Nightwing|Star Lord|Vision|Falcon|Moon Knight|Ms Marvel|She Hulk|Gambit|Rogue|Jean Grey|Professor X|Beast|Iceman|Martian Manhunter|Hellboy|Blade|Punisher|Luke Cage|Jessica Jones",
    d: "Blue Beetle|Booster Gold|Squirrel Girl|Nova|Hawkgirl|Zatanna|Swamp Thing|Spawn|Static|Plastic Man|Elongated Man|Firestorm|Black Canary|Nightcrawler|Colossus|Kitty Pryde|Shang Chi|Iron Fist|Quicksilver|Banshee|Atom",
    m: "Arm Fall Off Boy|Matter Eater Lad|Bouncing Boy|Dazzler|Doop|Mr Immortal|Flatman|Big Bertha|Jubilee|Cloak|Dagger|Animal Man|Metamorpho|Ragman|Captain Atom|Speedball|Sleepwalker|Darkhawk",
  }),
  q("sport", "Sports", "Name a sport played with a ball", {
    p: "Soccer=Football|Basketball|Baseball|Tennis|Golf|Volleyball|American Football",
    s: "Rugby|Cricket|Bowling|Softball|Table Tennis=Ping Pong|Handball|Water Polo|Dodgeball|Lacrosse|Pool=Billiards|Squash|Racquetball|Kickball",
    r: "Netball|Polo|Pickleball|Badminton|Croquet|Bocce|Field Hockey|Snooker|Futsal|Water polo|Paddle tennis|Padel|Australian Rules Football=Aussie Rules",
    d: "Hurling|Gaelic Football|Jai Alai=Pelota|Sepak Takraw|Korfball|Bandy|Cricket Darts|Goalball|Petanque|Teqball|Hornussen|Rounders|Fives|Footvolley",
    m: "Kin Ball|Kabaddi Ball|Buzkashi|Calcio Storico|Pato|Chinlone|Tchoukball|Bossaball|Shinty|Real Tennis|Elephant Polo|Cuju|Pelota Purepecha",
  }),
  q("pokemon", "Games", "Name an original 151 Pokemon", {
    p: "Pikachu|Charizard|Bulbasaur|Charmander|Squirtle|Mewtwo|Eevee|Jigglypuff",
    s: "Snorlax|Gengar|Psyduck|Meowth|Mew|Gyarados|Blastoise|Venusaur|Dragonite|Magikarp|Onix|Machamp|Vulpix|Ditto|Lapras|Articuno|Zapdos|Moltres|Charmeleon|Wartortle|Ivysaur|Raichu|Slowpoke",
    r: "Alakazam|Abra|Geodude|Golem|Arcanine|Growlithe|Cubone|Marowak|Haunter|Gastly|Butterfree|Caterpie|Metapod|Weedle|Pidgey|Rattata|Ekans|Arbok|Zubat|Golbat|Oddish|Poliwag|Tentacool|Ponyta|Rapidash|Magnemite|Voltorb|Electrode|Kangaskhan|Scyther|Jynx|Electabuzz|Magmar|Pinsir|Tauros|Vaporeon|Jolteon|Flareon|Porygon|Omanyte|Kabuto|Aerodactyl|Dratini|Clefairy|Sandshrew|Nidoking",
    d: "Farfetchd|Dodrio|Doduo|Seel|Dewgong|Grimer|Muk|Shellder|Cloyster|Drowzee|Hypno|Krabby|Kingler|Exeggcute|Exeggutor|Hitmonlee|Hitmonchan|Lickitung|Koffing|Weezing|Rhyhorn|Rhydon|Chansey|Tangela|Horsea|Seadra|Goldeen|Seaking|Staryu|Starmie|Mr Mime|Kabutops|Omastar|Dragonair|Paras|Parasect|Venonat|Venomoth|Diglett|Dugtrio|Mankey|Primeape",
    m: "Nidoran|Nidorina|Nidorino|Nidoqueen|Clefable|Wigglytuff|Gloom|Vileplume|Poliwhirl|Poliwrath|Kadabra|Machop|Machoke|Bellsprout|Weepinbell|Victreebel|Tentacruel|Graveler|Slowbro|Magneton|Pidgeotto|Pidgeot|Spearow|Fearow|Raticate|Sandslash|Ninetales|Persian|Golduck|Kakuna|Beedrill",
  }),
  q("shakespeare", "Literature", "Name a Shakespeare play", {
    p: "Romeo and Juliet|Hamlet|Macbeth",
    s: "Othello|King Lear|A Midsummer Nights Dream=Midsummer Nights Dream|Julius Caesar|The Tempest=Tempest|Much Ado About Nothing|Twelfth Night|The Merchant of Venice=Merchant of Venice",
    r: "The Taming of the Shrew=Taming of the Shrew|Richard III|Henry V|As You Like It|Antony and Cleopatra|The Comedy of Errors=Comedy of Errors|The Winters Tale=Winters Tale|Richard II|Henry IV",
    d: "Coriolanus|Titus Andronicus|Measure for Measure|Alls Well That Ends Well|Cymbeline|Troilus and Cressida|The Merry Wives of Windsor=Merry Wives of Windsor|Henry VIII|Pericles|Timon of Athens|Loves Labours Lost|King John|Henry VI",
    m: "The Two Gentlemen of Verona=Two Gentlemen of Verona|The Two Noble Kinsmen=Two Noble Kinsmen|Edward III|Cardenio|Loves Labours Won",
  }),
  q("car", "Brands", "Name a car brand", {
    p: "Toyota|Ford|Honda|BMW|Tesla|Chevrolet=Chevy|Mercedes=Mercedes Benz",
    s: "Audi|Volkswagen=VW|Nissan|Hyundai|Kia|Ferrari|Porsche|Lamborghini|Jeep|Subaru|Mazda|Dodge|Lexus|Volvo|Jaguar|Cadillac|GMC|Fiat|Mini|Land Rover",
    r: "Bugatti|Maserati|Aston Martin|Rolls Royce|Bentley|McLaren|Alfa Romeo|Peugeot|Renault|Citroen|Mitsubishi|Buick|Lincoln|Chrysler|Acura|Infiniti|Genesis|Skoda|Seat|Rivian|Lucid|Polestar|Suzuki",
    d: "Koenigsegg|Pagani|Lotus|Saab|Lada|Dacia|Opel|Vauxhall|Pontiac|Oldsmobile|Plymouth|Saturn|Hummer|Daewoo|BYD|Geely|Tata|Mahindra|Proton|Holden|Smart|DeLorean|Studebaker",
    m: "Rimac|Spyker|Hispano Suiza|Morgan|TVR|Noble|Ginetta|Wiesmann|Isuzu|Packard|AMC|Hudson|Nash|Tatra|Trabant|Zastava|Yugo|Vector|Saleen|Hennessey|Ariel|Caterham|Lancia|Abarth|Datsun|Scion|Mercury",
  }),
  q("disney", "Movies", "Name a Disney princess (or heroine)", {
    p: "Cinderella|Ariel|Belle|Elsa|Moana|Rapunzel|Jasmine",
    s: "Snow White|Aurora=Sleeping Beauty|Mulan|Pocahontas|Tiana|Merida|Anna",
    r: "Raya|Mirabel|Asha|Esmeralda|Megara=Meg|Jane|Kida|Alice|Wendy|Giselle",
    d: "Nala|Vanellope|Eilonwy|Kiara|Nani|Lilo|Tinker Bell=Tinkerbell|Penny|Maid Marian",
    m: "Nakoma|Melody|Atta|Dot|Sofia|Elena|Kida Nedakh|Mittens|Gwen",
  }),
  q("instrument", "Music", "Name a musical instrument", {
    p: "Guitar|Piano|Drums|Violin|Flute|Trumpet",
    s: "Saxophone|Cello|Clarinet|Bass|Ukulele|Harp|Trombone|Keyboard|Tuba|Banjo|Harmonica|Xylophone|Recorder|Accordion|Tambourine|Triangle|Oboe|French Horn|Viola",
    r: "Bassoon|Mandolin|Bagpipes|Sitar|Organ|Harpsichord|Piccolo|Cymbals|Bongos|Marimba|Glockenspiel|Synthesizer|Didgeridoo|Kazoo|Steel Drum|Double Bass|Cowbell|Castanets|Lute",
    d: "Theremin|Hurdy Gurdy|Shamisen|Koto|Erhu|Balalaika|Ocarina|Dulcimer|Zither|Bouzouki|Tabla|Djembe|Kalimba|Melodica|Celesta|Vibraphone|Oud|Euphonium|Sousaphone|Cornet|Flugelhorn|Pan Flute|Lyre",
    m: "Nyckelharpa|Hang Drum=Handpan|Serpent|Crwth|Sackbut|Ondes Martenot|Glass Harmonica|Waterphone|Kora|Guzheng|Pipa|Sarangi|Santoor|Tanpura|Morin Khuur|Charango|Cuica|Duduk|Bandoneon|Contrabassoon|Ophicleide|Mbira|Stylophone|Cimbalom",
  }),
  q("pasta", "Food", "Name a pasta shape", {
    p: "Spaghetti|Penne|Macaroni|Lasagna=Lasagne|Fettuccine|Ravioli",
    s: "Linguine|Rigatoni|Fusilli|Farfalle=Bow Tie|Tortellini|Rotini|Angel Hair=Capellini|Ziti|Orzo|Gnocchi|Shells=Conchiglie",
    r: "Orecchiette|Pappardelle|Tagliatelle|Cavatappi|Bucatini|Manicotti|Cannelloni|Gemelli|Ditalini|Vermicelli|Campanelle|Radiatori|Tortelloni|Paccheri",
    d: "Strozzapreti|Trofie|Casarecce|Mafaldine|Cavatelli|Agnolotti|Malloreddus|Pici|Fregola|Anelli|Stelline|Lumache|Calamarata|Garganelli|Rotelle",
    m: "Corzetti|Lorighittas|Busiate|Su Filindeu|Cappelletti|Sorpresine|Fazzoletti|Tripoline|Creste di Gallo|Cappellacci|Fileja|Scialatielli|Mezzelune|Testaroli|Gramigna",
  }),
  q("bird", "Animals", "Name a bird", {
    p: "Eagle|Penguin|Parrot|Owl|Pigeon|Chicken|Flamingo|Crow",
    s: "Robin|Hawk|Falcon|Ostrich|Peacock|Hummingbird|Sparrow|Blue Jay|Cardinal|Duck|Swan|Goose|Turkey|Seagull=Gull|Toucan|Woodpecker|Vulture|Pelican|Raven|Emu",
    r: "Stork|Heron|Crane|Kiwi|Puffin|Albatross|Condor|Magpie|Finch|Canary|Cockatoo|Macaw|Kingfisher|Starling|Swallow|Dove|Quail|Pheasant|Osprey|Roadrunner|Mockingbird|Oriole",
    d: "Cassowary|Kookaburra|Hoopoe|Lyrebird|Shoebill|Secretary Bird|Ibis|Egret|Spoonbill|Booby|Frigatebird|Cormorant|Loon|Grebe|Nightingale|Wren|Nuthatch|Kea|Kakapo|Hornbill|Tanager|Waxwing",
    m: "Potoo|Hoatzin|Oilbird|Kagu|Quetzal|Bowerbird|Frogmouth|Sunbittern|Dodo|Takahe|Weka|Bee Eater|Treecreeper|Dunnock|Bobolink|Phainopepla|Wallcreeper|Jabiru|Turaco|Motmot|Pitta|Tui",
  }),
  q("capital", "Geography", "Name a European capital city", {
    p: "Paris|London|Rome|Berlin|Madrid",
    s: "Amsterdam|Athens|Lisbon|Vienna|Dublin|Moscow|Stockholm|Oslo|Copenhagen|Brussels|Prague|Warsaw|Budapest",
    r: "Helsinki|Reykjavik|Bern|Kyiv=Kiev|Bucharest|Sofia|Belgrade|Zagreb|Bratislava|Monaco|Edinburgh|Luxembourg",
    d: "Tallinn|Riga|Vilnius|Ljubljana|Sarajevo|Skopje|Tirana|Podgorica|Minsk|Chisinau|Valletta|Nicosia|Andorra la Vella|Cardiff|Belfast|Vatican City",
    m: "Vaduz|San Marino|Pristina|Tbilisi|Yerevan|Baku|Torshavn|Douglas|Gibraltar|Saint Helier|Saint Peter Port|Mariehamn|Nuuk",
  }),
  q("cheese", "Food", "Name a type of cheese", {
    p: "Cheddar|Mozzarella|Parmesan|Swiss|American|Brie",
    s: "Gouda|Feta|Cream Cheese|Provolone|Ricotta|Blue Cheese|Pepper Jack|Monterey Jack|Colby|Camembert|Goat Cheese|Cottage Cheese|Mascarpone|Muenster",
    r: "Gruyere|Havarti|Manchego|Halloumi|Emmental|Gorgonzola|Roquefort|Stilton|Edam|Asiago|Burrata|Pecorino|Fontina|Paneer|Queso Fresco|Boursin|Jarlsberg|Wensleydale",
    d: "Taleggio|Comte|Raclette|Reblochon|Limburger|Leicester|Red Leicester|Cotija|Oaxaca|Manouri|Kasseri|Gjetost|Cambozola|Lancashire|Epoisses|Port Salut|Saint Agur|Morbier|Mimolette|Stracciatella",
    m: "Casu Marzu|Pule|Vacherin|Tete de Moine|Livarot|Pont l Eveque|Ossau Iraty|Caciocavallo|Bryndza|Oscypek|Leyden|Brunost|Graviera|Kefalotyri|Sbrinz|Appenzeller|Shropshire Blue|Stinking Bishop|Cornish Yarg|Juustoleipa",
  }),
  q("greek", "Mythology", "Name a Greek god or goddess", {
    p: "Zeus|Poseidon|Hades|Athena|Aphrodite|Apollo",
    s: "Hera|Ares|Hermes|Artemis|Dionysus|Hephaestus|Demeter|Persephone|Nike|Eros",
    r: "Hestia|Gaia|Kronos=Cronus|Hecate|Pan|Helios|Selene|Nyx|Uranus|Rhea|Nemesis|Atlas|Prometheus|Morpheus",
    d: "Eos|Hypnos|Thanatos|Tyche|Iris|Hebe|Eris|Asclepius|Themis|Mnemosyne|Oceanus|Tethys|Hyperion|Chaos|Erebus|Aether|Nereus|Triton|Boreas|Zephyrus|Priapus",
    m: "Hemera|Phanes|Ananke|Chronos|Pontus|Tartarus|Phoebe|Coeus|Crius|Iapetus|Theia|Metis|Styx|Harmonia|Enyo|Deimos|Phobos|Hymenaios|Eileithyia|Notus|Eurus|Momus|Achelous",
  }),
  q("colors", "Art", "Name a color (not a basic rainbow color)", {
    p: "Pink|Brown|Black|White|Gray=Grey|Purple",
    s: "Turquoise|Magenta|Beige|Maroon|Navy|Teal|Lavender|Gold|Silver|Cyan|Lime|Peach|Tan|Coral|Burgundy|Cream|Olive",
    r: "Crimson|Scarlet|Fuchsia|Mauve|Lilac|Ivory|Khaki|Aquamarine|Periwinkle|Mint|Charcoal|Mustard|Salmon|Plum|Emerald|Sapphire|Amber|Rust|Sienna|Ochre|Bronze|Copper|Taupe",
    d: "Chartreuse|Cerulean|Vermilion|Puce|Ecru|Umber|Sepia|Mahogany|Cobalt|Ultramarine|Celadon|Viridian|Carmine|Cerise|Gamboge|Saffron|Burnt Orange|Eggplant|Aubergine|Heliotrope|Wisteria|Chocolate",
    m: "Falu Red|Wenge|Smaragdine|Glaucous|Coquelicot|Fulvous|Xanadu|Bistre|Mikado|Feldgrau|Gingerline|Zaffre|Atomic Tangerine|Isabelline|Caput Mortuum|Eburnean|Amaranth|Razzmatazz|Phlox|Arsenic",
  }),
  q("sitcom", "TV", "Name a TV sitcom", {
    p: "Friends|The Office=Office|Seinfeld|The Big Bang Theory=Big Bang Theory|How I Met Your Mother",
    s: "Brooklyn Nine Nine|Parks and Recreation=Parks and Rec|Modern Family|The Simpsons=Simpsons|Two and a Half Men|Cheers|Frasier|Community|Arrested Development|New Girl|Its Always Sunny in Philadelphia=Always Sunny|Schitts Creek|Fresh Prince of Bel Air=Fresh Prince|Full House|That 70s Show|Ted Lasso",
    r: "30 Rock|Curb Your Enthusiasm|Scrubs|The Good Place=Good Place|Superstore|Abbott Elementary|Everybody Loves Raymond|Malcolm in the Middle|I Love Lucy|Married with Children|Fawlty Towers|Mr Bean|Black Books|The IT Crowd=IT Crowd|Veep|Silicon Valley|Family Matters|Happy Days|MASH|Taxi",
    d: "What We Do in the Shadows|Peep Show|Spaced|Party Down|Detroiters|Corner Gas|Kim's Convenience=Kims Convenience|Letterkenny|Father Ted|Red Dwarf|Blackadder|Ugly Betty|Reno 911|Dinner Time|Happy Endings|Enlightened|Bob Hearts Abishola|Rutherford Falls|Rules of Engagement",
    m: "Andy Barker PI|Better Off Ted|The Grinder|Selfie|Trophy Wife|Ben and Kate|Dead Pixels|Toast of London|Toast of Tinseltown|Garth Marenghis Darkplace|Stath Lets Flats|Ghosts|Detectorists|Sunnyside|Brockmire|Review|Nathan for You|Lodge 49|Party of Five",
  }),
  q("vegetable", "Food", "Name a vegetable", {
    p: "Carrot|Broccoli|Potato|Lettuce|Onion|Corn|Spinach",
    c: "Tomato|Ketchup|Pizza",
    s: "Celery|Cabbage|Cauliflower|Pea|Peas|Green Bean|Zucchini|Garlic|Mushroom|Kale|Asparagus|Sweet Potato|Radish|Beet|Brussels Sprouts|Squash|Artichoke",
    r: "Leek|Turnip|Parsnip|Okra|Bok Choy|Arugula|Rutabaga|Shallot|Endive|Fennel|Chard|Swiss Chard|Watercress|Collard Greens|Edamame|Scallion|Jicama",
    d: "Kohlrabi|Celeriac|Salsify|Jerusalem Artichoke=Sunchoke|Romanesco|Daikon|Radicchio|Taro|Yam|Cassava=Yuca|Bamboo Shoot|Lotus Root|Water Chestnut|Burdock|Mizuna|Fiddlehead|Chayote|Tomatillo",
    m: "Oca|Skirret|Cardoon|Ulluco|Yacon|Crosne|Nopal|Samphire|Sea Kale|Good King Henry|Mashua|Purslane|Malabar Spinach|Celtuce|Kai Lan|Gai Lan|Ramps|Hamburg Parsley",
  }),
  q("board", "Games", "Name a board game", {
    p: "Monopoly|Chess|Scrabble|Checkers|Clue=Cluedo|Candy Land=Candyland|Sorry",
    s: "Risk|Trivial Pursuit|Battleship|Connect Four|Guess Who|Operation|Life=The Game of Life|Catan=Settlers of Catan|Backgammon|Pictionary|Chutes and Ladders=Snakes and Ladders|Jenga|Mouse Trap|Stratego|Yahtzee",
    r: "Ticket to Ride|Pandemic|Carcassonne|Go|Othello|Mahjong|Mastermind|Codenames|Taboo|Ludo|Parcheesi|Boggle|Hungry Hungry Hippos|Axis and Allies|Kingdomino|Dixit|Azul|Splendor",
    d: "Wingspan|Gloomhaven|Twilight Imperium|Terraforming Mars|Dominion|Agricola|Puerto Rico|7 Wonders|Root|Scythe|Power Grid|Diplomacy|Mancala|Chinese Checkers|Shogi|Xiangqi|Hive|Blokus|Cranium|Arkham Horror",
    m: "Brass Birmingham|Through the Ages|Spirit Island|Everdell|Cascadia|Viticulture|Patchwork|Hanabi|Tigris and Euphrates|El Grande|Senet|Hnefatafl|Nine Mens Morris|Royal Game of Ur|Fox and Geese|Tak|Onitama|Santorini|Inis|Hansa Teutonica|Concordia",
  }),
  q("dinosaur", "Science", "Name a dinosaur", {
    p: "Tyrannosaurus Rex=T Rex=Tyrannosaurus|Triceratops|Velociraptor=Raptor|Stegosaurus|Brontosaurus|Brachiosaurus",
    c: "Pterodactyl|Pteranodon|Barney|Dino",
    s: "Spinosaurus|Ankylosaurus|Diplodocus|Allosaurus|Parasaurolophus|Iguanodon|Pachycephalosaurus|Dilophosaurus|Apatosaurus|Indominus Rex",
    r: "Carnotaurus|Giganotosaurus|Gallimimus|Compsognathus|Archaeopteryx|Deinonychus|Therizinosaurus|Utahraptor|Baryonyx|Argentinosaurus|Edmontosaurus|Oviraptor",
    d: "Microraptor|Troodon|Maiasaura|Protoceratops|Styracosaurus|Kentrosaurus|Corythosaurus|Ceratosaurus|Megalosaurus|Coelophysis|Plateosaurus|Mamenchisaurus|Amargasaurus|Suchomimus|Herrerasaurus|Eoraptor",
    m: "Irritator|Mei Long|Nigersaurus|Dracorex|Bambiraptor|Masiakasaurus|Gigantoraptor|Yutyrannus|Sinosauropteryx|Minmi|Leaellynasaura|Qianzhousaurus|Zuul|Borealopelta|Halszkaraptor|Kosmoceratops|Einiosaurus|Concavenator",
  }),
  q("fastfood", "Brands", "Name a fast food chain", {
    p: "McDonalds|Burger King|Wendys|KFC|Subway|Taco Bell",
    s: "Chick fil A|Pizza Hut|Dominos|Five Guys|Arbys|Sonic|Popeyes|Chipotle|Dairy Queen|Jack in the Box|In N Out|Panda Express|Starbucks|Dunkin=Dunkin Donuts|Little Caesars|Papa Johns",
    r: "Shake Shack|Whataburger|White Castle|Carls Jr|Hardees|Culvers|Wingstop|Raising Canes|Jimmy Johns|Panera|Quiznos|Del Taco|Bojangles|Long John Silvers|Church's Chicken=Churchs Chicken|Krystal|Nandos|Tim Hortons|Jollibee",
    d: "Checkers|Rallys|Steak n Shake|Freddys|Zaxbys|El Pollo Loco|Wienerschnitzel|A and W|Smashburger|Firehouse Subs|Jersey Mikes|Qdoba|Moes|Cook Out|Greggs|Pret a Manger=Pret|Hesburger|Lotteria|MOS Burger",
    m: "Krispy Krunchy|Dick's Drive In=Dicks Drive In|Runza|Burgerville|Bob Evans|Taco Johns|Taco Time|Lees Famous Recipe|Wahlburgers|Pollo Campero|Max Burgers|Quick|Chicken Licken|Chester's|Big Boy|Swensons|Hot n Now|Burger Chef|Roy Rogers",
  }),
  q("harrypotter", "Books", "Name a Harry Potter character", {
    p: "Harry Potter=Harry|Hermione Granger=Hermione|Ron Weasley=Ron|Dumbledore=Albus Dumbledore|Voldemort|Snape=Severus Snape|Hagrid",
    s: "Draco Malfoy=Draco|Sirius Black=Sirius|Dobby|Neville Longbottom=Neville|Ginny Weasley=Ginny|Luna Lovegood=Luna|McGonagall|Fred Weasley|George Weasley|Bellatrix Lestrange=Bellatrix|Lucius Malfoy|Remus Lupin=Lupin|Hedwig|Cedric Diggory|Dudley Dursley|Cho Chang",
    r: "Molly Weasley|Arthur Weasley|Percy Weasley|Charlie Weasley|Bill Weasley|Peter Pettigrew=Wormtail|Mad Eye Moody=Alastor Moody|Tonks|Dolores Umbridge=Umbridge|Gilderoy Lockhart|Quirrell|Argus Filch=Filch|Kreacher|Fleur Delacour|Viktor Krum|Moaning Myrtle|Nearly Headless Nick|Crookshanks|Fawkes|Buckbeak|Aragog",
    d: "Seamus Finnigan|Dean Thomas|Lavender Brown|Oliver Wood|Professor Sprout|Flitwick|Sybill Trelawney=Trelawney|Slughorn|Peeves|Griphook|Kingsley Shacklebolt|Rita Skeeter|Cornelius Fudge|Barty Crouch|Lee Jordan|Hannah Abbott|Ernie Macmillan|Padma Patil|Parvati Patil|Gregory Goyle|Vincent Crabbe|Mrs Norris|Fenrir Greyback",
    m: "Mundungus Fletcher|Aberforth Dumbledore|Xenophilius Lovegood|Bathilda Bagshot|Ollivander|Madam Pomfrey|Madam Hooch|Madam Pince|Madam Rosmerta|Romilda Vane|Cormac McLaggen|Zacharias Smith|Marcus Flint|Stan Shunpike|Ernie Prang|Dedalus Diggle|Elphias Doge|Hepzibah Smith|Merope Gaunt|Morfin Gaunt|Winky|Hokey|Gellert Grindelwald|Scabior",
  }),
  q("tree", "Nature", "Name a type of tree", {
    p: "Oak|Pine|Maple|Palm|Apple|Christmas Tree",
    s: "Birch|Willow|Redwood|Cherry|Elm|Spruce|Fir|Cedar|Ash|Sequoia|Aspen|Beech|Walnut|Magnolia|Poplar|Cypress|Banyan",
    r: "Sycamore|Hickory|Chestnut|Juniper|Eucalyptus|Baobab|Dogwood|Hemlock|Larch|Yew|Alder|Mahogany|Teak|Bamboo|Olive|Ginkgo|Cottonwood|Mangrove|Acacia|Linden",
    d: "Hawthorn|Rowan|Hornbeam|Sweetgum|Tulip Tree|Catalpa|Locust|Tamarack|Sassafras|Buckeye|Horse Chestnut|Jacaranda|Joshua Tree|Bristlecone Pine|Monkey Puzzle|Kapok|Ebony|Rosewood|Balsa|Sandalwood|Wollemi Pine|Dragon Blood Tree",
    m: "Osage Orange|Hophornbeam|Pawpaw|Persimmon|Franklinia|Kauri|Totara|Rimu|Kahikatea|Pohutukawa|Jarrah|Karri|Boojum|Quiver Tree|Sausage Tree|Rainbow Eucalyptus|Ceiba|Idesia|Katsura|Zelkova|Sourwood|Yellowwood|Blackgum=Tupelo",
  }),
  q("language", "Culture", "Name a language", {
    p: "English|Spanish|French|Chinese=Mandarin|German|Japanese",
    s: "Italian|Portuguese|Russian|Arabic|Korean|Hindi|Dutch|Greek|Latin|Swedish|Polish|Turkish|Hebrew|Cantonese|Vietnamese|Tagalog=Filipino|Sign Language|ASL",
    r: "Swahili|Bengali|Urdu|Punjabi|Persian=Farsi|Thai|Indonesian|Norwegian|Danish|Finnish|Czech|Hungarian|Romanian|Ukrainian|Irish|Gaelic|Welsh|Tamil|Esperanto|Klingon|Elvish|Navajo",
    d: "Icelandic|Basque|Catalan|Amharic|Yoruba|Zulu|Xhosa|Hausa|Igbo|Malay|Khmer|Lao|Burmese|Mongolian|Tibetan|Nepali|Pashto|Kurdish|Armenian|Georgian|Albanian|Maori|Hawaiian|Quechua|Cherokee|Yiddish|Sanskrit|Dothraki|Telugu|Gujarati|Marathi",
    m: "Faroese|Sami|Breton|Cornish|Manx|Frisian|Romansh|Ladino|Aramaic|Coptic|Ainu|Ewe|Wolof|Tok Pisin|Guarani|Aymara|Nahuatl|Inuktitut|Chechen|Ossetian|Sorbian|Silbo Gomero|Lojban|Toki Pona|Sumerian|Akkadian|Etruscan|Tigrinya",
  }),
  q("ocean-free-city", "Geography", "Name a US state", {
    p: "California|Texas|Florida|New York|Hawaii|Alaska",
    s: "Washington|Ohio|Georgia|Illinois|Michigan|Arizona|Colorado|Nevada|Pennsylvania|New Jersey|Massachusetts|Virginia|North Carolina|Tennessee|Oregon|Utah|Louisiana",
    r: "Minnesota|Wisconsin|Missouri|Kentucky|Alabama|Indiana|Oklahoma|Kansas|Iowa|Maryland|South Carolina|Connecticut|Mississippi|Arkansas|New Mexico|Montana|Idaho|Maine",
    d: "Nebraska|Wyoming|Vermont|New Hampshire|West Virginia|South Dakota|North Dakota|Rhode Island",
    m: "Delaware",
  }),
  q("celebrity", "Pop Culture", "Name a celebrity known by one name", {
    p: "Beyonce|Rihanna|Madonna|Adele|Drake|Cher|Shakira",
    s: "Prince|Eminem|Oprah|Pink|Zendaya|Lizzo|Bono|Sting|Usher|Moby|Pele|Banksy|Elvis|Seal|Akon|Ciara|Lorde|Sia",
    r: "Bjork|Enya|Brandy|Monica|Aaliyah|Nelly|Ludacris|Pitbull|Jewel|Common|Mya|Ashanti|Kesha|Grimes|Halsey|Charo|Fabio|Ronaldinho|Kaka|Neymar|Teller|Slash|Flea|Shaggy",
    d: "Sade|Yanni|Liberace|Tiffany|Donovan|Lulu|Twiggy|Iman|Gisele|Brandy Norwood|Morrissey|Sisqo|Coolio|Tiesto|Avicii|Skrillex|Marshmello|Mika|Yungblud|Rosalia|Anitta|Bad Bunny",
    m: "Nico|Melanie|Dido|Shakin Stevens|Divine|Sabu|Mononoke|Hergé=Herge|Moebius|Brassai|Nadar|Lysippos|Mobutu|Suharto|Sukarno|Nena|Alizee|Nolwenn|Stromae|Kiesza|Robyn|Aurora|Raye",
  }),
];

/** Frozen first full daily bank; retained for historical score verification. */
export const ORIGINAL_FULL_QUESTIONS: Question[] = [...DAILY_QUESTIONS, ...practiceBank(q)];
export const EXPANSION_QUESTIONS: Question[] = expansionBank(q);
/** Current shared daily and practice pool. */
export const QUESTIONS: Question[] = [...ORIGINAL_FULL_QUESTIONS, ...EXPANSION_QUESTIONS];

/** Topic extras stay separate so published daily decks and scores never change. */
export const THEMED_QUESTIONS: Question[] = themedBank(q);
export const ALL_QUESTIONS: Question[] = [...QUESTIONS, ...THEMED_QUESTIONS];
