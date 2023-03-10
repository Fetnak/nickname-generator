# nickname generator
Generates nicknames based on the probability of encountering a letter after the previous ones. Probabilities are calculated from any text, for example: from books (Result from book won't be suitable for nicknames, but they will be readable passwords :D). 

# Installation

1. Install [Node.js](https://nodejs.org/en/) (tested on Node.js v16.17.0)
2. Execute these commands
```
# install pnpm
npm add -g pnpm
# clone nickname generator repo
git clone https://github.com/Fetnak/nickname-generator.git
# open nickname generator folder
cd nickname-generator
# install requirements
pnpm install
```
3. Installation done. Test generator by creating some nicknames
```
pnpm start nicknameGenerator -u a4ab9a86-0a24-41b0-a7ed-d095e0faef3a --seed 123
```

# Usage
## Generating model

1. Word counter 

To generate model you need text file that you want to convert into model. You need to use `wordCounter` to make file with words

```
pnpm start wordCounter -i "/path/to/file.txt"
```
By default, `wordCounter` uses english alphabet to cound words. 

Use `-l` or `--language` option to use built-in alphabets. Available `-l` arguments `eng, rus, bel, ukr, ita, swe, fre, deu, spa`. 

Or use your own alphabet using option `--alphabet` or `-a`. For example `-a 'abcdefghijklmnopqrstuvwxyz'`.

In output `wordCounter` will give you UUID, for example `200ff5c5-7cbe-45a4-b4e8-d49b78218bd8` , that you should use in `modelCreator`.

For additional information use `pnpm start wordCounter --help`

2. Model creator 

To generate model you need UUID of words. If you forgot it, use `pnpm start modelCreator --list` to list all available words.

```
pnpm start modelCreator -i 200ff5c5-7cbe-45a4-b4e8-d49b78218bd8 
```

In output `modelCreator` will give you UUID, for example `a4ab9a86-0a24-41b0-a7ed-d095e0faef3a` , that you should use in `nicknameGenerator` for creating nicknames.

For additional information use `pnpm start modelCreator --help`

## Generating nicknames

To generate nicknames you need UUID of model. Use `pnpm start nicknameGenerator --list` to list all available models. Example UUID `a4ab9a86-0a24-41b0-a7ed-d095e0faef3a`.

```
pnpm start nicknameGenerator -u a4ab9a86-0a24-41b0-a7ed-d095e0faef3a
```

Generator uses random seed. But you can set your own by `-S` of `--seed` option

```
pnpm start nicknameGenerator -u a4ab9a86-0a24-41b0-a7ed-d095e0faef3a -S 123
```

Output will look like this
```
> pnpm start nicknameGenerator -u a4ab9a86-0a24-41b0-a7ed-d095e0faef3a -S 123

Nicknames have been created for too long! Generated only 231 nicknames from 240 planned.
Ruau     Beaj     Dand     Vayl     Mimick   Kath     Ialli    Aeya     Vibe     Timi     Lane     Lden
Janar    Rica     Kalya    Nnah     Mren     Make     Kina     Mzoley   Arius    Hion     Dinyazai Marie
Dionddne Jhais    Asie     Saxto    Fennah   Gabrad   Sinzelup Honesmir Monn     Jeyma    Aharlari Aessabsh
Meronnas Maizerse Odelkely Than     Joehe    Gali     Ayaryn   Chel     Jery     Sirya    Brunyiah Keli
Celey    Mber     Jaxon    Comi     Raan     Pecksh   Erelah   Shdin    Olilaia  Gaya     Kani     Armya
Bette    Deen     Cechaily Netzy    Zailadys Amematl  Sance    Kori     Zeed     Kara     Vlyn     Khalyn
Miya     Keed     Aiya     Jace     Rina     Avora    Stoir    Siamazya Anabeye  Ikyia    Glen     Ayon
Jocaily  Uliaheid Onor     Ceyan    Katt     Jaylia   Porgra   Elix     Beddi    Nedan    Garius   Dane
Klynn    Kilan    Drie     Anella   Jahannab Dedellen Kyie     Aiah     Carkeon  Inte     Fraely   Talin
Criya    Cairajid Dalenez  Avief    Ephth    Khazerin Wechola  Della    Shees    Analeyar Remyliah Thyai
Miarnoli Egori    Yanna    Ssazen   Carti    Grace    Irpero   Jagolian Sheena   Yohncarr Merolia  Stion
Padra    Javynn   Stehlais Adiris   Zilyndli Jonorn   Mmella   Anqsa    Oshrabra Areyn    Phistin  Licolyna
Josthia  Cilbremi Marisson Bdiarico Brylien  Serinnis Belian   Zamilo   Atelliay Dangeg   Alaraley Coreagat
Tahwesta Eeeanny  Devemori Rgunna   Abailyde Kazorie  Reylynan Riulinia Cheusley Arylin   Bannixsw Jesharov
Ragenex  Dmaaleor Kyliel   Samari   Kaijah   Ssefawze Adaoual  Krither  Gabetson Nevereys Madesela Jalain
Lliann   Slelion  Ayriarya Veryly   Tamilee  Theodon  Kehland  Lanikal  Raiah    Arianna  Mckeley  Enson
Lyellyn  Vikta    Deefa    Estah    Larvi    Sanvie   Bella    Macko    Disara   Carens   Saanan   Jihani
Joricus  Bhoriya  Cieniah  Peigha   Kinove   Deehann  Ayrille  Millae   Kaligen  Mirair   Levanna  Qayled
Nicella  Kirrevo  Anoaan   Chnasia  Ylorah   Blaron   Wglina   Kaishe   Miaimir  Mourar   Gioton   Ghaylyn
Sofinie  Crisabe  Mariell
```

`Nicknames have been created for too long! Generated only 231 nicknames from 240 planned.` With incorrect options generator can calculate nicknames forever. To avoid it, generator will stop calculating after a certain amount of unsuccessful attempts. 

You can change number of this attempts by yourself using `--generateAttempts` or `-g` option.
```
> pnpm start nicknameGenerator -u a4ab9a86-0a24-41b0-a7ed-d095e0faef3a -S 123 -g 999

Ruau     Beaj     Dand     Vayl     Mimick   Kath     Ialli    Aeya     Vibe     Timi     Lane     Lden
Janar    Rica     Kalya    Nnah     Mren     Make     Kina     Mzoley   Arius    Hion     Dinyazai Marie
Dionddne Jhais    Asie     Saxto    Fennah   Gabrad   Sinzelup Honesmir Monn     Jeyma    Aharlari Aessabsh
Meronnas Maizerse Odelkely Than     Joehe    Gali     Ayaryn   Chel     Jery     Sirya    Brunyiah Keli
Celey    Mber     Jaxon    Comi     Raan     Pecksh   Erelah   Shdin    Olilaia  Gaya     Kani     Armya
Bette    Deen     Cechaily Netzy    Zailadys Amematl  Sance    Kori     Zeed     Kara     Vlyn     Khalyn
Miya     Keed     Aiya     Jace     Rina     Avora    Stoir    Siamazya Anabeye  Ikyia    Glen     Ayon
Jocaily  Uliaheid Onor     Ceyan    Katt     Jaylia   Porgra   Elix     Beddi    Nedan    Garius   Dane
Klynn    Kilan    Drie     Anella   Jahannab Dedellen Kyie     Aiah     Carkeon  Inte     Fraely   Talin
Criya    Cairajid Dalenez  Avief    Ephth    Khazerin Wechola  Della    Shees    Analeyar Remyliah Thyai
Miarnoli Egori    Yanna    Ssazen   Carti    Grace    Irpero   Jagolian Sheena   Yohncarr Merolia  Stion
Padra    Javynn   Stehlais Adiris   Zilyndli Jonorn   Mmella   Anqsa    Oshrabra Areyn    Phistin  Licolyna
Josthia  Cilbremi Marisson Bdiarico Brylien  Serinnis Belian   Zamilo   Atelliay Dangeg   Alaraley Coreagat
Tahwesta Eeeanny  Devemori Rgunna   Abailyde Kazorie  Reylynan Riulinia Cheusley Arylin   Bannixsw Jesharov
Ragenex  Dmaaleor Kyliel   Samari   Kaijah   Ssefawze Adaoual  Krither  Gabetson Nevereys Madesela Jalain
Lliann   Slelion  Ayriarya Veryly   Tamilee  Theodon  Kehland  Lanikal  Raiah    Arianna  Mckeley  Enson
Lyellyn  Vikta    Deefa    Estah    Larvi    Sanvie   Bella    Macko    Disara   Carens   Saanan   Jihani
Joricus  Bhoriya  Cieniah  Peigha   Kinove   Deehann  Ayrille  Millae   Kaligen  Mirair   Levanna  Qayled
Nicella  Kirrevo  Anoaan   Chnasia  Ylorah   Blaron   Wglina   Kaishe   Miaimir  Mourar   Gioton   Ghaylyn
Sofinie  Crisabe  Mariell  Meseler  Carlint  Jouston  Dilbere  Taliyna  Matikri  Caeleer  Hrimryd  Caverar
```

By default, generator calculates 240 nicknames (you can change it using `--count` option). As you can see, using `-g` option we can make generator calculates more nicknames.

For additional information use `pnpm start nicknameGenerator --help`

# To-do list
- [ ] Use byte arrays instead of strings in models.
- [ ] Use arrays instead of objects to store weights.
- [x] Use 2 or more characters to generate next.
- [x] Calculate beginning characters.
- [ ] Make beginning-characters-weights from ending-characters-weights.
- [ ] Use normal names as model identifiers (It was a bad idea to use UUID).
- [ ] Creating model from text file in one command.
- [ ] Hide logs and make `--verbose` option to write them.

# Help

## Main help
```
> pnpm start --help

index.js [command]

Commands:
  index.js wordCounter        Counts all words in text file and places the result into the data file and the information file.
  index.js modelCreator       Use files from a word counter tool to create a model to create nicknames for nickname generator.
  index.js nicknameGenerator  Generates multiple nicknames.

Options:
  --help  Show help
```

## Word counter help
```
> pnpm start wordCounter --help

index.js wordCounter

Counts all words in text file and places the result into the data file and the information file.

Options:
  -h, --help             Show help [boolean]
  -i, --input            Path to the text file which needs to be analyzed. [string] [required]
  -c, --chunk            Size of the processed chunk at a time (in MB). [number] [default: 16]
      --sizeLimit, --sl  Limit for each file with words (in MB). [number] [default: 4]
  -p, --partsToLoad      How many word files are stored in RAM during processing. [number] [default: 5]
  -l, --language         Language of the text. [string] [choices: "eng", "rus", "bel", "ukr", "ita", "swe", "fre", "deu", "spa"] [default: "eng"]
  -a, --alphabet         Custom alphabet. [string]
  -u, --uuid             Select your own uuid instead of random. [string]
      --description      Description. Just description. [string]
```

## Model creator help
```
> pnpm start modelCreator --help

index.js modelCreator

Use files from a word counter tool to create a model to create nicknames for nickname generator.

Options:
  -h, --help                   Show help. [boolean]
  -i, --inputUuid              UUID of a file with words.
  -o, --outputUuid             UUID for result model file.
  -s, --sequence               Size of the character sequence to be processed to create the model. [number] [default: 3]
  -p, --parameters             Path to parameters file, which will be applied during creating model. [string]
  -l, --list                   Display all available files from word counter tool. [boolean]
      --sizeLimit, --sl        Limit for output chances files (in MB). [number] [default: 1]
      --tempSizeLimit, --tsl   Limit for each temp file with words (in MB). [number] [default: 16]
      --fullSizeLimit, --fsl   Limit for all temp files in RAM (in MB). [number] [default: 128]
      --checkStep              Step for check size of model data in RAM and logging. [number] [default: 10000]
      --lengthOfWord, --lpw    Minimum length of the word to be used to create the model. [number] [default: 2]
      --calculateEnding, --ce  Calculate the chance of ending a word. [boolean] [default: true]
      --resetMultiplier, --rm  Always take the multiplier as 1. [boolean] [default: false]
```

## Nickname generator help
```
> pnpm start nicknameGenerator --help

index.js nicknameGenerator

Generates multiple nicknames.

Options:
  -h, --help                 Show help [boolean]
  -u, --uuid                 UUID of model. [string]
      --minimum, --min       Minimum number of characters to generate. [number] [default: 4]
      --maximum, --max       Maximum number of characters to generate. [number] [default: 8]
      --minAccuracy, --mina  Min number of previous characters, which will be used to generate next character. [number] [default: 1]
      --maxAccuracy, --maxa  Max number of previous characters, which will be used to generate next character. [number] [default: 3]
  -A, --progressAccuracy     Accuracy of progress percent. [number]
  -c, --count                How many nicknames should be generated. [number] [default: 240]
  -M, --counterMultiplier    Multiplier for the count of nicknames to speed up generation. Increases memory usage. [number] [default: 1]
  -C, --columns              How many columns will the nicknames be sorted into (0 for auto). [number] [default: 12]
  -f, --form                 In what form to provide nicknames. [string] [choices: "console", "json", "text"] [default: "console"]
  -o, --output               Path to save file with nicknames. [string] [default: "./resources/nicknames/"]
      --cacheSize, --cs      Size of cache of model. [number] [default: 128]
  -l, --list                 Display all available models. [boolean]
  -p, --part                 The part of every nickname. [string] [default: ""]
  -P, --partPosition         The position of the part for every nickname. Can be [0, 1] or -1 for random. [number] [default: 0]
  -e, --endSuddenly          Don't use the model to determine the end of nicknames. [boolean]
  -g, --generateAttempts     How many attempts to generate nicknames (effective for small models). [number]
  -S, --seed                 Seed for random function. [number]
  -m, --lengthsMultiplier    Multiplier to initialization of lengths. 0 to disable initialization of lengths for the generator. [number] [default: 1]
  -s, --sort                 Sort output nicknames. [string] [choices: "none", "random", "asc", "desc", "asc2", "desc2"] [default: "none"]
```
