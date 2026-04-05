#!/usr/bin/env node
/**
 * Run once from your project root:
 *   node patch_asrs_questions.js
 *
 * Adds asrsQ1–asrsQ18 to every language in your translations file.
 * Update TRANSLATIONS_PATH below if your file lives elsewhere.
 */

const fs   = require('fs');
const path = require('path');

const TRANSLATIONS_PATH = path.join(__dirname, 'src', 'translations', 'index.js');

const ASRS_QUESTIONS = {
  en: {
    asrsQ1:  'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    asrsQ2:  'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    asrsQ3:  'How often do you have problems remembering appointments or obligations?',
    asrsQ4:  'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    asrsQ5:  'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    asrsQ6:  'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    asrsQ7:  'How often do you make careless mistakes when you have to work on a boring or difficult project?',
    asrsQ8:  'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
    asrsQ9:  'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
    asrsQ10: 'How often do you misplace or have difficulty finding things at home or at work?',
    asrsQ11: 'How often are you distracted by activity or noise around you?',
    asrsQ12: 'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?',
    asrsQ13: 'How often do you feel restless or fidgety?',
    asrsQ14: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
    asrsQ15: 'How often do you find yourself talking too much when you are in social situations?',
    asrsQ16: 'How often do you find yourself finishing the sentences of the people you are talking to?',
    asrsQ17: 'How often do you have difficulty waiting your turn in situations when turn taking is required?',
    asrsQ18: 'How often do you interrupt others when they are busy?',
  },
  no: {
    asrsQ1:  'Hvor ofte har du problemer med å avslutte de siste detaljene i et prosjekt, når de utfordrende delene er gjort?',
    asrsQ2:  'Hvor ofte har du vanskeligheter med å organisere ting når du må gjøre en oppgave som krever organisering?',
    asrsQ3:  'Hvor ofte glemmer du avtaler eller forpliktelser?',
    asrsQ4:  'Når du har en oppgave som krever mye tankearbeid, hvor ofte unngår eller utsetter du å begynne?',
    asrsQ5:  'Hvor ofte sitter du urolig eller piller med hendene eller føttene når du må sitte stille lenge?',
    asrsQ6:  'Hvor ofte føler du deg overdrevent aktiv og tvunget til å gjøre ting, som om du var drevet av en motor?',
    asrsQ7:  'Hvor ofte gjør du skjødesløse feil når du arbeider med et kjedelig eller vanskelig prosjekt?',
    asrsQ8:  'Hvor ofte har du vanskeligheter med å holde oppmerksomheten når du gjør kjedelig eller repetitivt arbeid?',
    asrsQ9:  'Hvor ofte har du vanskeligheter med å konsentrere deg om hva folk sier til deg, selv når de snakker direkte til deg?',
    asrsQ10: 'Hvor ofte mister du ting eller har vanskeligheter med å finne ting hjemme eller på jobb?',
    asrsQ11: 'Hvor ofte blir du distrahert av aktivitet eller støy rundt deg?',
    asrsQ12: 'Hvor ofte forlater du plassen din i møter eller andre situasjoner der du forventes å sitte stille?',
    asrsQ13: 'Hvor ofte føler du deg rastløs eller urolig?',
    asrsQ14: 'Hvor ofte har du vanskeligheter med å slappe av og roe deg ned når du har tid for deg selv?',
    asrsQ15: 'Hvor ofte snakker du for mye i sosiale situasjoner?',
    asrsQ16: 'Hvor ofte fullfører du setningene til folk du snakker med?',
    asrsQ17: 'Hvor ofte har du vanskeligheter med å vente på tur i situasjoner der det kreves?',
    asrsQ18: 'Hvor ofte avbryter du andre når de er opptatt?',
  },
  sv: {
    asrsQ1:  'Hur ofta har du svårt att avsluta de sista detaljerna i ett projekt, när de utmanande delarna är klara?',
    asrsQ2:  'Hur ofta har du svårt att få saker i ordning när du måste utföra en uppgift som kräver organisation?',
    asrsQ3:  'Hur ofta har du problem med att komma ihåg möten eller åtaganden?',
    asrsQ4:  'När du har en uppgift som kräver mycket tankearbete, hur ofta undviker eller skjuter du upp att börja?',
    asrsQ5:  'Hur ofta sitter du och pular med händerna eller fötterna när du måste sitta stilla länge?',
    asrsQ6:  'Hur ofta känner du dig överdrivet aktiv och tvungen att göra saker, som om du drevs av en motor?',
    asrsQ7:  'Hur ofta gör du slarviga misstag när du arbetar med ett tråkigt eller svårt projekt?',
    asrsQ8:  'Hur ofta har du svårt att hålla uppmärksamheten när du gör tråkigt eller repetitivt arbete?',
    asrsQ9:  'Hur ofta har du svårt att koncentrera dig på vad folk säger till dig, även när de talar direkt till dig?',
    asrsQ10: 'Hur ofta tappar du bort saker eller har svårt att hitta saker hemma eller på jobbet?',
    asrsQ11: 'Hur ofta distraheras du av aktivitet eller ljud runt omkring dig?',
    asrsQ12: 'Hur ofta lämnar du din plats på möten eller i andra situationer där du förväntas sitta kvar?',
    asrsQ13: 'Hur ofta känner du dig rastlös eller orolig?',
    asrsQ14: 'Hur ofta har du svårt att varva ner och slappna av när du har tid för dig själv?',
    asrsQ15: 'Hur ofta pratar du för mycket i sociala situationer?',
    asrsQ16: 'Hur ofta slutför du meningarna hos de personer du pratar med?',
    asrsQ17: 'Hur ofta har du svårt att vänta på din tur i situationer där turordning krävs?',
    asrsQ18: 'Hur ofta avbryter du andra när de är upptagna?',
  },
  da: {
    asrsQ1:  'Hvor ofte har du svært ved at afslutte de sidste detaljer i et projekt, når de udfordrende dele er gjort?',
    asrsQ2:  'Hvor ofte har du svært ved at få tingene i orden, når du skal udføre en opgave, der kræver organisation?',
    asrsQ3:  'Hvor ofte har du problemer med at huske aftaler eller forpligtelser?',
    asrsQ4:  'Når du har en opgave, der kræver meget tankearbeid, hvor ofte undgår eller udsætter du at gå i gang?',
    asrsQ5:  'Hvor ofte sidder du uroligt eller piller med hænder eller fødder, når du skal sidde stille i lang tid?',
    asrsQ6:  'Hvor ofte føler du dig overdrevent aktiv og tvunget til at gøre ting, som om du var drevet af en motor?',
    asrsQ7:  'Hvor ofte laver du skødesløse fejl, når du arbejder på et kedeligt eller svært projekt?',
    asrsQ8:  'Hvor ofte har du svært ved at holde opmærksomheden, når du udfører kedeligt eller gentagende arbejde?',
    asrsQ9:  'Hvor ofte har du svært ved at koncentrere dig om, hvad folk siger til dig, selv når de taler direkte til dig?',
    asrsQ10: 'Hvor ofte mister du ting eller har svært ved at finde ting derhjemme eller på arbejdet?',
    asrsQ11: 'Hvor ofte distraheres du af aktivitet eller støj omkring dig?',
    asrsQ12: 'Hvor ofte forlader du din plads til møder eller i andre situationer, hvor du forventes at blive siddende?',
    asrsQ13: 'Hvor ofte føler du dig rastløs eller urolig?',
    asrsQ14: 'Hvor ofte har du svært ved at slappe af og sunde dig, når du har tid for dig selv?',
    asrsQ15: 'Hvor ofte taler du for meget i sociale situationer?',
    asrsQ16: 'Hvor ofte afslutter du sætningerne hos de personer, du taler med?',
    asrsQ17: 'Hvor ofte har du svært ved at vente på tur i situationer, hvor det kræves?',
    asrsQ18: 'Hvor ofte afbryder du andre, når de er optaget?',
  },
  de: {
    asrsQ1:  'Wie oft haben Sie Schwierigkeiten, die letzten Details eines Projekts abzuschließen, wenn die anspruchsvollen Teile erledigt sind?',
    asrsQ2:  'Wie oft haben Sie Schwierigkeiten, Dinge in Ordnung zu bringen, wenn Sie eine Aufgabe erledigen müssen, die Organisation erfordert?',
    asrsQ3:  'Wie oft haben Sie Probleme, sich an Termine oder Verpflichtungen zu erinnern?',
    asrsQ4:  'Wenn Sie eine Aufgabe haben, die viel Nachdenken erfordert, wie oft vermeiden oder verzögern Sie den Beginn?',
    asrsQ5:  'Wie oft zappeln Sie mit den Händen oder Füßen, wenn Sie lange sitzen müssen?',
    asrsQ6:  'Wie oft fühlen Sie sich übermäßig aktiv und gezwungen, Dinge zu tun, als würden Sie von einem Motor angetrieben?',
    asrsQ7:  'Wie oft machen Sie leichtsinnige Fehler, wenn Sie an einem langweiligen oder schwierigen Projekt arbeiten?',
    asrsQ8:  'Wie oft haben Sie Schwierigkeiten, die Aufmerksamkeit aufrechtzuerhalten, wenn Sie langweilige oder sich wiederholende Arbeit erledigen?',
    asrsQ9:  'Wie oft haben Sie Schwierigkeiten, sich auf das zu konzentrieren, was andere Ihnen sagen, selbst wenn sie direkt mit Ihnen sprechen?',
    asrsQ10: 'Wie oft verlegen Sie Dinge oder haben Schwierigkeiten, Dinge zu Hause oder bei der Arbeit zu finden?',
    asrsQ11: 'Wie oft werden Sie durch Aktivitäten oder Geräusche in Ihrer Umgebung abgelenkt?',
    asrsQ12: 'Wie oft verlassen Sie Ihren Platz in Meetings oder anderen Situationen, in denen erwartet wird, dass Sie sitzen bleiben?',
    asrsQ13: 'Wie oft fühlen Sie sich ruhelos oder zappelig?',
    asrsQ14: 'Wie oft haben Sie Schwierigkeiten, sich zu entspannen und abzuschalten, wenn Sie Zeit für sich haben?',
    asrsQ15: 'Wie oft stellen Sie fest, dass Sie in sozialen Situationen zu viel reden?',
    asrsQ16: 'Wie oft stellen Sie fest, dass Sie die Sätze der Personen beenden, mit denen Sie sprechen?',
    asrsQ17: 'Wie oft haben Sie Schwierigkeiten, in Situationen zu warten, in denen Turnus erforderlich ist?',
    asrsQ18: 'Wie oft unterbrechen Sie andere, wenn diese beschäftigt sind?',
  },
  fr: {
    asrsQ1:  "À quelle fréquence avez-vous du mal à terminer les derniers détails d'un projet, une fois les parties difficiles accomplies?",
    asrsQ2:  "À quelle fréquence avez-vous du mal à organiser les choses lorsque vous devez effectuer une tâche nécessitant de l'organisation?",
    asrsQ3:  "À quelle fréquence avez-vous des problèmes pour vous souvenir de vos rendez-vous ou obligations?",
    asrsQ4:  "Lorsque vous avez une tâche qui nécessite beaucoup de réflexion, à quelle fréquence évitez-vous ou retardez-vous le début?",
    asrsQ5:  "À quelle fréquence vous agitez-vous avec les mains ou les pieds lorsque vous devez rester assis longtemps?",
    asrsQ6:  "À quelle fréquence vous sentez-vous excessivement actif et obligé de faire des choses, comme si vous étiez propulsé par un moteur?",
    asrsQ7:  "À quelle fréquence faites-vous des erreurs d'inattention lorsque vous travaillez sur un projet ennuyeux ou difficile?",
    asrsQ8:  "À quelle fréquence avez-vous du mal à maintenir votre attention lorsque vous effectuez un travail ennuyeux ou répétitif?",
    asrsQ9:  "À quelle fréquence avez-vous du mal à vous concentrer sur ce que les gens vous disent, même lorsqu'ils vous parlent directement?",
    asrsQ10: "À quelle fréquence perdez-vous des objets ou avez-vous du mal à trouver des choses à la maison ou au travail?",
    asrsQ11: "À quelle fréquence êtes-vous distrait par une activité ou un bruit autour de vous?",
    asrsQ12: "À quelle fréquence quittez-vous votre siège lors de réunions ou dans d'autres situations où vous êtes censé rester assis?",
    asrsQ13: "À quelle fréquence vous sentez-vous agité ou nerveux?",
    asrsQ14: "À quelle fréquence avez-vous du mal à vous détendre lorsque vous avez du temps pour vous?",
    asrsQ15: "À quelle fréquence vous retrouvez-vous à parler trop dans des situations sociales?",
    asrsQ16: "À quelle fréquence vous retrouvez-vous à terminer les phrases des personnes avec qui vous parlez?",
    asrsQ17: "À quelle fréquence avez-vous du mal à attendre votre tour dans des situations où cela est nécessaire?",
    asrsQ18: "À quelle fréquence interrompez-vous les autres quand ils sont occupés?",
  },
  nl: {
    asrsQ1:  'Hoe vaak heeft u moeite met het afronden van de laatste details van een project, zodra de uitdagende onderdelen zijn gedaan?',
    asrsQ2:  'Hoe vaak heeft u moeite dingen te organiseren wanneer u een taak moet uitvoeren die organisatie vereist?',
    asrsQ3:  'Hoe vaak heeft u problemen met het onthouden van afspraken of verplichtingen?',
    asrsQ4:  'Wanneer u een taak heeft die veel nadenken vereist, hoe vaak vermijdt of stelt u dan het beginnen uit?',
    asrsQ5:  'Hoe vaak beweegt u uw handen of voeten nerveus wanneer u lang moet zitten?',
    asrsQ6:  'Hoe vaak voelt u zich overdreven actief en gedwongen om dingen te doen, alsof u door een motor wordt aangedreven?',
    asrsQ7:  'Hoe vaak maakt u onzorgvuldige fouten wanneer u aan een saai of moeilijk project werkt?',
    asrsQ8:  'Hoe vaak heeft u moeite uw aandacht vast te houden wanneer u saai of repetitief werk doet?',
    asrsQ9:  'Hoe vaak heeft u moeite u te concentreren op wat mensen u zeggen, zelfs wanneer ze rechtstreeks tegen u praten?',
    asrsQ10: 'Hoe vaak verlegt u dingen of heeft u moeite met het vinden van dingen thuis of op het werk?',
    asrsQ11: 'Hoe vaak raakt u afgeleid door activiteiten of geluiden om u heen?',
    asrsQ12: 'Hoe vaak verlaat u uw stoel tijdens vergaderingen of andere situaties waar u geacht wordt te blijven zitten?',
    asrsQ13: 'Hoe vaak voelt u zich rusteloos of druk?',
    asrsQ14: 'Hoe vaak heeft u moeite met tot rust komen en ontspannen wanneer u tijd voor uzelf heeft?',
    asrsQ15: 'Hoe vaak merkt u dat u te veel praat in sociale situaties?',
    asrsQ16: 'Hoe vaak maakt u de zinnen af van de mensen met wie u spreekt?',
    asrsQ17: 'Hoe vaak heeft u moeite uw beurt af te wachten in situaties waar beurtwisseling vereist is?',
    asrsQ18: 'Hoe vaak onderbreekt u anderen wanneer ze bezig zijn?',
  },
  it: {
    asrsQ1:  'Con quale frequenza hai difficoltà a concludere gli ultimi dettagli di un progetto, una volta completate le parti impegnative?',
    asrsQ2:  'Con quale frequenza hai difficoltà a mettere le cose in ordine quando devi svolgere un compito che richiede organizzazione?',
    asrsQ3:  'Con quale frequenza hai problemi a ricordare appuntamenti o obblighi?',
    asrsQ4:  'Quando hai un compito che richiede molto pensiero, con quale frequenza eviti o ritardi di iniziare?',
    asrsQ5:  'Con quale frequenza ti agiti con le mani o i piedi quando devi stare seduto per molto tempo?',
    asrsQ6:  'Con quale frequenza ti senti eccessivamente attivo e costretto a fare cose, come se fossi guidato da un motore?',
    asrsQ7:  'Con quale frequenza commetti errori per disattenzione quando lavori su un progetto noioso o difficile?',
    asrsQ8:  "Con quale frequenza hai difficoltà a mantenere l'attenzione quando svolgi un lavoro noioso o ripetitivo?",
    asrsQ9:  'Con quale frequenza hai difficoltà a concentrarti su ciò che le persone ti dicono, anche quando parlano direttamente con te?',
    asrsQ10: 'Con quale frequenza perdi le cose o hai difficoltà a trovare oggetti a casa o al lavoro?',
    asrsQ11: 'Con quale frequenza sei distratto da attività o rumori intorno a te?',
    asrsQ12: 'Con quale frequenza lasci il tuo posto durante riunioni o altre situazioni in cui si prevede che tu rimanga seduto?',
    asrsQ13: 'Con quale frequenza ti senti irrequieto o agitato?',
    asrsQ14: 'Con quale frequenza hai difficoltà a rilassarti quando hai del tempo per te stesso?',
    asrsQ15: 'Con quale frequenza ti ritrovi a parlare troppo nelle situazioni sociali?',
    asrsQ16: 'Con quale frequenza ti ritrovi a completare le frasi delle persone con cui stai parlando?',
    asrsQ17: 'Con quale frequenza hai difficoltà ad aspettare il tuo turno nelle situazioni che lo richiedono?',
    asrsQ18: 'Con quale frequenza interrompi gli altri quando sono occupati?',
  },
  es: {
    asrsQ1:  '¿Con qué frecuencia tienes dificultades para terminar los últimos detalles de un proyecto, una vez completadas las partes difíciles?',
    asrsQ2:  '¿Con qué frecuencia tienes dificultades para organizar las cosas cuando tienes que realizar una tarea que requiere organización?',
    asrsQ3:  '¿Con qué frecuencia tienes problemas para recordar citas u obligaciones?',
    asrsQ4:  '¿Cuando tienes una tarea que requiere mucho pensamiento, con qué frecuencia evitas o retrasar empezar?',
    asrsQ5:  '¿Con qué frecuencia te mueves nerviosamente con las manos o los pies cuando tienes que sentarte durante mucho tiempo?',
    asrsQ6:  '¿Con qué frecuencia te sientes excesivamente activo y obligado a hacer cosas, como si estuvieras impulsado por un motor?',
    asrsQ7:  '¿Con qué frecuencia cometes errores por descuido cuando tienes que trabajar en un proyecto aburrido o difícil?',
    asrsQ8:  '¿Con qué frecuencia tienes dificultades para mantener la atención cuando realizas un trabajo aburrido o repetitivo?',
    asrsQ9:  '¿Con qué frecuencia tienes dificultades para concentrarte en lo que la gente te dice, incluso cuando te hablan directamente?',
    asrsQ10: '¿Con qué frecuencia pierdes cosas o tienes dificultades para encontrar cosas en casa o en el trabajo?',
    asrsQ11: '¿Con qué frecuencia te distraes con la actividad o el ruido a tu alrededor?',
    asrsQ12: '¿Con qué frecuencia abandonas tu asiento en reuniones u otras situaciones en las que se espera que permanezcas sentado?',
    asrsQ13: '¿Con qué frecuencia te sientes inquieto o nervioso?',
    asrsQ14: '¿Con qué frecuencia tienes dificultades para relajarte cuando tienes tiempo para ti mismo?',
    asrsQ15: '¿Con qué frecuencia te encuentras hablando demasiado en situaciones sociales?',
    asrsQ16: '¿Con qué frecuencia te encuentras terminando las frases de las personas con las que estás hablando?',
    asrsQ17: '¿Con qué frecuencia tienes dificultades para esperar tu turno en situaciones donde se requiere?',
    asrsQ18: '¿Con qué frecuencia interrumpes a los demás cuando están ocupados?',
  },
  fi: {
    asrsQ1:  'Kuinka usein sinulla on vaikeuksia viimeistellä projektin viimeiset yksityiskohdat, kun haastavat osat on tehty?',
    asrsQ2:  'Kuinka usein sinulla on vaikeuksia järjestää asioita, kun sinun täytyy suorittaa tehtävä, joka vaatii organisointia?',
    asrsQ3:  'Kuinka usein sinulla on ongelmia muistaa tapaamisia tai velvollisuuksia?',
    asrsQ4:  'Kun sinulla on tehtävä, joka vaatii paljon ajattelua, kuinka usein vältät tai viivästytät aloittamista?',
    asrsQ5:  'Kuinka usein heiluttelet käsiäsi tai jalkojasi hermostuneesti, kun sinun täytyy istua pitkään?',
    asrsQ6:  'Kuinka usein tunnet olevasi liian aktiivinen ja pakotettu tekemään asioita, kuin moottori ajaisi sinua?',
    asrsQ7:  'Kuinka usein teet huolimattomia virheitä, kun sinun täytyy työskennellä tylsän tai vaikean projektin parissa?',
    asrsQ8:  'Kuinka usein sinulla on vaikeuksia pitää tarkkaavaisuutesi yllä, kun teet tylsää tai toistuvaa työtä?',
    asrsQ9:  'Kuinka usein sinulla on vaikeuksia keskittyä siihen, mitä ihmiset sinulle sanovat, vaikka he puhuisivat suoraan sinulle?',
    asrsQ10: 'Kuinka usein kadotat tavaroita tai sinulla on vaikeuksia löytää asioita kotona tai töissä?',
    asrsQ11: 'Kuinka usein sinua häiritsee toiminta tai melu ympärilläsi?',
    asrsQ12: 'Kuinka usein poistut paikaltasi kokouksissa tai muissa tilanteissa, joissa sinun odotetaan pysyvän istumassa?',
    asrsQ13: 'Kuinka usein tunnet olosi levottomaksi tai hermostuneeksi?',
    asrsQ14: 'Kuinka usein sinulla on vaikeuksia rentoutua ja rauhoittua, kun sinulla on aikaa itsellesi?',
    asrsQ15: 'Kuinka usein huomaat puhuvasi liikaa sosiaalisissa tilanteissa?',
    asrsQ16: 'Kuinka usein huomaat viimeistelevän ihmisten lauseet, joiden kanssa puhut?',
    asrsQ17: 'Kuinka usein sinulla on vaikeuksia odottaa vuoroasi tilanteissa, joissa vuorottelua vaaditaan?',
    asrsQ18: 'Kuinka usein keskeytät muita, kun he ovat kiireisiä?',
  },
  pt: {
    asrsQ1:  'Com que frequência tem dificuldade em terminar os últimos detalhes de um projeto, depois de as partes difíceis estarem concluídas?',
    asrsQ2:  'Com que frequência tem dificuldade em organizar as coisas quando tem de realizar uma tarefa que exige organização?',
    asrsQ3:  'Com que frequência tem problemas em lembrar-se de compromissos ou obrigações?',
    asrsQ4:  'Quando tem uma tarefa que exige muito pensamento, com que frequência evita ou atrasa começar?',
    asrsQ5:  'Com que frequência se mexe nervosamente com as mãos ou os pés quando tem de ficar sentado durante muito tempo?',
    asrsQ6:  'Com que frequência se sente excessivamente ativo e compelido a fazer coisas, como se fosse impulsionado por um motor?',
    asrsQ7:  'Com que frequência comete erros por descuido quando tem de trabalhar num projeto aborrecido ou difícil?',
    asrsQ8:  'Com que frequência tem dificuldade em manter a atenção quando realiza um trabalho aborrecido ou repetitivo?',
    asrsQ9:  'Com que frequência tem dificuldade em concentrar-se no que as pessoas lhe dizem, mesmo quando lhe falam diretamente?',
    asrsQ10: 'Com que frequência perde coisas ou tem dificuldade em encontrar coisas em casa ou no trabalho?',
    asrsQ11: 'Com que frequência se distrai com atividade ou ruído à sua volta?',
    asrsQ12: 'Com que frequência abandona o seu lugar em reuniões ou noutras situações em que se espera que fique sentado?',
    asrsQ13: 'Com que frequência se sente inquieto ou agitado?',
    asrsQ14: 'Com que frequência tem dificuldade em descontrair quando tem tempo para si?',
    asrsQ15: 'Com que frequência se apercebe de que fala demasiado em situações sociais?',
    asrsQ16: 'Com que frequência se apercebe de que termina as frases das pessoas com quem está a falar?',
    asrsQ17: 'Com que frequência tem dificuldade em esperar pela sua vez em situações que o exigem?',
    asrsQ18: 'Com que frequência interrompe os outros quando estão ocupados?',
  },
};

// ── Inject into translations file ────────────────────────────────────────────
if (!fs.existsSync(TRANSLATIONS_PATH)) {
  console.error('❌ Translations file not found at:', TRANSLATIONS_PATH);
  console.log('Update TRANSLATIONS_PATH at the top of this script.');
  process.exit(1);
}

let source  = fs.readFileSync(TRANSLATIONS_PATH, 'utf8');
let total   = 0;
let skipped = 0;

for (const [lang, questions] of Object.entries(ASRS_QUESTIONS)) {
  const langMarker = `  ${lang}: {`;
  const idx = source.indexOf(langMarker);
  if (idx === -1) {
    console.warn(`⚠️  Language '${lang}' not found in translations file, skipping.`);
    continue;
  }

  // Check which keys already exist
  const toAdd = {};
  for (const [key, value] of Object.entries(questions)) {
    // Check if key already exists anywhere in the file
    if (source.includes(`    ${key}:`) || source.includes(`    ${key} :`)) {
      skipped++;
      continue;
    }
    toAdd[key] = value;
  }

  if (Object.keys(toAdd).length === 0) {
    console.log(`⏭️  '${lang}' — all keys already exist, skipping.`);
    continue;
  }

  const newKeysStr = Object.entries(toAdd)
    .map(([k, v]) => `    ${k}: '${v.replace(/'/g, "\\'")}',`)
    .join('\n');

  const insertAt = source.indexOf('\n', idx) + 1;
  source = source.slice(0, insertAt) + newKeysStr + '\n' + source.slice(insertAt);
  total += Object.keys(toAdd).length;
  console.log(`✅ '${lang}' — added ${Object.keys(toAdd).length} question keys`);
}

fs.writeFileSync(TRANSLATIONS_PATH, source, 'utf8');
console.log(`\n✅ Done! Added ${total} keys. Skipped ${skipped} already-existing keys.`);