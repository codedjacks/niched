import type { Question } from "./types";
import type { Q } from "./questions.practice";

/** Extra questions that fill out the Sports and History themed challenges. */
export const themedBank = (q: Q): Question[] => [
  // ---------- Sports ----------
  q("nfl", "Sports", "Name an NFL team", {
    p: "Dallas Cowboys=Cowboys|New England Patriots=Patriots|Kansas City Chiefs=Chiefs|Green Bay Packers=Packers|Pittsburgh Steelers=Steelers",
    s: "San Francisco 49ers=49ers=Niners|Philadelphia Eagles=Eagles|New York Giants=Giants|Chicago Bears=Bears|Denver Broncos=Broncos|Seattle Seahawks=Seahawks|Miami Dolphins=Dolphins|Buffalo Bills=Bills|Baltimore Ravens=Ravens",
    r: "Las Vegas Raiders=Raiders|New York Jets=Jets|Detroit Lions=Lions|Minnesota Vikings=Vikings|Los Angeles Rams=Rams|Cincinnati Bengals=Bengals|Cleveland Browns=Browns|Tampa Bay Buccaneers=Buccaneers=Bucs|New Orleans Saints=Saints|Washington Commanders=Commanders",
    d: "Indianapolis Colts=Colts|Atlanta Falcons=Falcons|Carolina Panthers=Panthers|Los Angeles Chargers=Chargers|Houston Texans=Texans|Tennessee Titans=Titans|Arizona Cardinals=Cardinals",
    m: "Jacksonville Jaguars=Jaguars=Jags",
  }),
  q("nba", "Sports", "Name an NBA team", {
    p: "Los Angeles Lakers=Lakers|Boston Celtics=Celtics|Chicago Bulls=Bulls|Golden State Warriors=Warriors|Miami Heat=Heat",
    s: "New York Knicks=Knicks|Brooklyn Nets=Nets|San Antonio Spurs=Spurs|Cleveland Cavaliers=Cavaliers=Cavs|Dallas Mavericks=Mavericks=Mavs|Philadelphia 76ers=76ers=Sixers|Phoenix Suns=Suns|Milwaukee Bucks=Bucks",
    r: "Houston Rockets=Rockets|Denver Nuggets=Nuggets|Toronto Raptors=Raptors|Oklahoma City Thunder=Thunder|Los Angeles Clippers=Clippers|Detroit Pistons=Pistons|Atlanta Hawks=Hawks|Orlando Magic=Magic|Portland Trail Blazers=Trail Blazers=Blazers",
    d: "Utah Jazz=Jazz|Indiana Pacers=Pacers|Minnesota Timberwolves=Timberwolves|Memphis Grizzlies=Grizzlies|New Orleans Pelicans=Pelicans|Sacramento Kings=Kings|Washington Wizards=Wizards|Charlotte Hornets=Hornets",
    m: "Seattle SuperSonics=SuperSonics=Sonics|Vancouver Grizzlies|New Jersey Nets|Charlotte Bobcats=Bobcats|Washington Bullets=Bullets|New Orleans Hornets|Buffalo Braves",
  }),
  q("athlete", "Sports", "Name a famous athlete (any sport)", {
    p: "Michael Jordan|LeBron James|Serena Williams|Tom Brady|Lionel Messi=Messi|Cristiano Ronaldo=Ronaldo|Usain Bolt",
    s: "Tiger Woods|Kobe Bryant|Simone Biles|Michael Phelps|Muhammad Ali|Wayne Gretzky|Babe Ruth|Stephen Curry=Steph Curry|Roger Federer|Pele|Shaquille O Neal=Shaq|Kylian Mbappe=Mbappe",
    r: "Rafael Nadal=Nadal|Novak Djokovic=Djokovic|Venus Williams|Jackie Robinson|Derek Jeter|Peyton Manning|Patrick Mahomes|Shohei Ohtani|Lewis Hamilton|Naomi Osaka|Megan Rapinoe|Diego Maradona=Maradona|Magic Johnson|Larry Bird|Caitlin Clark",
    d: "Jesse Owens|Jim Thorpe|Nadia Comaneci|Florence Griffith Joyner=Flo Jo|Carl Lewis|Bo Jackson|Wilt Chamberlain|Bill Russell|Martina Navratilova|Steffi Graf|Ayrton Senna|Michael Schumacher|Eliud Kipchoge|Katie Ledecky|Mia Hamm|Zinedine Zidane=Zidane",
    m: "Paavo Nurmi|Emil Zatopek|Abebe Bikila|Babe Didrikson Zaharias|Sonja Henie|Bob Beamon|Fanny Blankers Koen|Cathy Freeman|Sachin Tendulkar|Don Bradman|Jonah Lomu|Ronda Rousey|Mondo Duplantis|Sydney McLaughlin|Faith Kipyegon|Larisa Latynina",
  }),
  q("soccer-club", "Sports", "Name a pro soccer club", {
    p: "Real Madrid|Barcelona=Barca=FC Barcelona|Manchester United=Man United=Man Utd|Liverpool|Chelsea",
    s: "Arsenal|Manchester City=Man City|Bayern Munich=Bayern|Juventus=Juve|PSG=Paris Saint Germain|AC Milan|Inter Miami|Tottenham=Spurs|Inter Milan=Inter",
    r: "Borussia Dortmund=Dortmund|Atletico Madrid|Ajax|Benfica|Porto|Celtic|Rangers|Napoli|Roma=AS Roma|LA Galaxy|Newcastle=Newcastle United|Aston Villa|Everton|West Ham",
    d: "Boca Juniors|River Plate|Flamengo|Santos|Galatasaray|Fenerbahce|Sporting CP=Sporting Lisbon|PSV|Feyenoord|Lazio|Sevilla|Valencia|Marseille|Lyon|Al Nassr|Seattle Sounders",
    m: "Wrexham|St Pauli|Union Berlin|Athletic Bilbao|Red Star Belgrade|Dinamo Zagreb|Club Brugge|Corinthians|Penarol|Nacional|Al Ahly|Kaizer Chiefs|Urawa Reds|Pachuca|Club America|Forest Green Rovers|Accrington Stanley",
  }),
  q("mlb", "Sports", "Name an MLB team", {
    p: "New York Yankees=Yankees|Boston Red Sox=Red Sox|Los Angeles Dodgers=Dodgers|Chicago Cubs=Cubs",
    s: "San Francisco Giants|St Louis Cardinals|Atlanta Braves=Braves|New York Mets=Mets|Houston Astros=Astros|Philadelphia Phillies=Phillies|Chicago White Sox=White Sox",
    r: "Texas Rangers|Seattle Mariners=Mariners|Toronto Blue Jays=Blue Jays|Detroit Tigers=Tigers|Baltimore Orioles=Orioles|San Diego Padres=Padres|Cleveland Guardians=Guardians|Oakland Athletics=Athletics=As",
    d: "Minnesota Twins=Twins|Milwaukee Brewers=Brewers|Cincinnati Reds=Reds|Pittsburgh Pirates=Pirates|Colorado Rockies=Rockies|Arizona Diamondbacks=Diamondbacks|Kansas City Royals=Royals|Los Angeles Angels=Angels",
    m: "Tampa Bay Rays=Rays|Miami Marlins=Marlins|Washington Nationals=Nationals|Montreal Expos=Expos|Brooklyn Dodgers|Seattle Pilots|Cleveland Indians",
  }),
  q("sport-term", "Sports", "Name a sports trophy or championship", {
    p: "Super Bowl|World Cup|Stanley Cup|World Series|NBA Finals",
    s: "Olympics|Wimbledon|Masters|Champions League|Heisman=Heisman Trophy|March Madness|Tour de France|Kentucky Derby|Daytona 500",
    r: "US Open|Ryder Cup|Ballon d Or|Lombardi Trophy|Larry OBrien Trophy|Indy 500=Indianapolis 500|Rose Bowl|French Open=Roland Garros|Australian Open|Grey Cup|Euros=European Championship",
    d: "Davis Cup|Copa America|Commissioners Trophy|Claret Jug|Calcutta Cup|Six Nations|Ashes|Belmont Stakes|Preakness|Little League World Series|Iditarod|FA Cup|Walker Cup",
    m: "Americas Cup|Solheim Cup|Bledisloe Cup|Webb Ellis Cup|Jules Rimet Trophy|Stanley Cup Finals|Thomas Cup|Uber Cup|Lady Byng|Conn Smythe|Vince Lombardi|Sam Maguire Cup|Borg Warner Trophy",
  }),
  // ---------- History ----------
  q("civilization", "History", "Name an ancient civilization", {
    p: "Egyptians=Ancient Egypt|Romans=Ancient Rome|Greeks=Ancient Greece|Aztecs|Maya=Mayans",
    s: "Incas|Vikings|Mesopotamia|Persians=Persian Empire|Chinese=Ancient China|Babylonians|Mongols",
    r: "Sumerians|Phoenicians|Carthaginians=Carthage|Spartans|Olmecs|Celts|Assyrians|Byzantines|Ottomans|Indus Valley|Hittites|Etruscans",
    d: "Minoans|Mycenaeans|Akkadians|Nubians=Kush|Aksumites=Aksum|Khmer|Toltecs|Zapotecs|Huns|Goths|Scythians|Parthians|Moche|Nazca",
    m: "Elamites|Hurrians|Urartu|Nabataeans|Sabaeans|Sogdians|Xiongnu|Olmec|Chavin|Tiwanaku|Wari|Harappans|Dilmun|Garamantes|Mississippians|Ancestral Puebloans|Jomon|Sanxingdui",
  }),
  q("war", "History", "Name a war", {
    p: "World War II=WWII=WW2|World War I=WWI=WW1|Civil War=American Civil War|Vietnam War|Revolutionary War=American Revolution",
    s: "Korean War|Cold War|Gulf War|Iraq War|War of 1812|Afghanistan War|Napoleonic Wars|Hundred Years War",
    r: "Crusades|Trojan War|Peloponnesian War|Punic Wars|Mexican American War|Spanish American War|French and Indian War|Seven Years War|Thirty Years War|Wars of the Roses|Falklands War|Six Day War",
    d: "Crimean War|Boer War|Opium Wars|Franco Prussian War|Russo Japanese War|Spanish Civil War|Winter War|Yom Kippur War|Iran Iraq War|Bosnian War|Hundred Days|Peninsular War",
    m: "War of Jenkins Ear|Pastry War|Football War|Emu War|Anglo Zanzibar War|Pig War|Toledo War|Aroostook War|Soccer War|War of the Bucket|War of the Golden Stool|Paraguayan War|Chaco War|Taiping Rebellion",
  }),
  q("explorer", "History", "Name a famous explorer", {
    p: "Christopher Columbus=Columbus|Marco Polo|Neil Armstrong",
    s: "Lewis and Clark=Lewis=Clark|Ferdinand Magellan=Magellan|Vasco da Gama|Amelia Earhart|Leif Erikson|Sacagawea|Captain Cook=James Cook|Hernan Cortes=Cortes",
    r: "Francisco Pizarro=Pizarro|Ponce de Leon|Hernando de Soto|Jacques Cartier|Henry Hudson|Roald Amundsen=Amundsen|Ernest Shackleton=Shackleton|Edmund Hillary|Tenzing Norgay|Sir Francis Drake=Francis Drake|Daniel Boone|Yuri Gagarin",
    d: "Robert Falcon Scott=Scott|Zheng He|Ibn Battuta|Amerigo Vespucci|Bartolomeu Dias|Samuel de Champlain|David Livingstone|Henry Morton Stanley|Robert Peary|Matthew Henson|John Cabot|Walter Raleigh|Jacques Cousteau",
    m: "Erik the Red|Abel Tasman|Vitus Bering|Pytheas|Xuanzang|Gertrude Bell|Isabella Bird|Ida Pfeiffer|Mary Kingsley|Fridtjof Nansen|Burke and Wills|Alexander von Humboldt|Juan Sebastian Elcano|Hanno the Navigator|Estevanico|Jeanne Baret",
  }),
  q("inventor", "History", "Name a famous inventor", {
    p: "Thomas Edison=Edison|Albert Einstein|Benjamin Franklin|Alexander Graham Bell|Wright Brothers=Orville Wright=Wilbur Wright",
    s: "Nikola Tesla=Tesla|Henry Ford|Leonardo da Vinci=Da Vinci|Steve Jobs|Isaac Newton|Galileo|James Watt|Johannes Gutenberg=Gutenberg",
    r: "Eli Whitney|Samuel Morse|George Washington Carver|Marie Curie|Guglielmo Marconi=Marconi|Tim Berners Lee|Bill Gates|Alfred Nobel|Louis Pasteur|Archimedes|Charles Babbage|Ada Lovelace",
    d: "Hedy Lamarr|Garrett Morgan|Philo Farnsworth|John Logie Baird|Rudolf Diesel|Karl Benz|Elisha Otis|Louis Braille|Alessandro Volta|Michael Faraday|Charles Goodyear|Cyrus McCormick|Lewis Latimer|Grace Hopper",
    m: "Hero of Alexandria|Al Jazari|Cai Lun|Zhang Heng|Nicolas Appert|Joseph Niepce|Granville Woods|Madam CJ Walker|Mary Anderson|Josephine Cochrane|Margaret Knight|Stephanie Kwolek|Tsutomu Yamaguchi|Ruth Wakefield|Percy Spencer|Willis Carrier",
  }),
  q("monarch", "History", "Name a king, queen, or emperor from history", {
    p: "Queen Elizabeth=Elizabeth II|King Henry VIII=Henry VIII|Cleopatra|Napoleon|Julius Caesar",
    s: "Queen Victoria=Victoria|King Tut=Tutankhamun|Marie Antoinette|Louis XIV|Alexander the Great|Genghis Khan|King Arthur|Charlemagne|Elizabeth I|King Charles=Charles III",
    r: "Ramses=Ramesses II|Augustus|Nero|Peter the Great|Catherine the Great|King George III=George III|Richard the Lionheart|William the Conqueror|Montezuma|Ivan the Terrible|Kublai Khan|Nicholas II|Hirohito",
    d: "Hatshepsut|Akhenaten|Nefertiti|Cyrus the Great|Darius|Xerxes|Hammurabi|Nebuchadnezzar|Hadrian|Constantine|Justinian|Suleiman the Magnificent|Mansa Musa|Shaka Zulu|Qin Shi Huang|Akbar",
    m: "Ashurbanipal|Sargon of Akkad|Wu Zetian|Theodora|Boudica|Zenobia|Ranavalona|Kamehameha|Liliuokalani|Menelik II|Pachacuti|Atahualpa|Tamar of Georgia|Jadwiga|Basil II|Ashoka|Moctezuma II|Sundiata Keita",
  }),
];
