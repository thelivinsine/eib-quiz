# Ten more languages — questions answered during the unattended run

**Purpose.** You asked for the languages plan to run without you. Each question below is one
I would have put to you. I answered each with its recommended option so the run could carry
on, and every answer can be undone. Please read them and tell me any you would answer
differently.

**Summary.**

- Each entry: the task it came from, the question, the options, the one taken, and why.
- The plan is [2026-10-11-languages-plan.md](2026-10-11-languages-plan.md), and its
  progress table names each question in the task's **Not verified** cell.

## 1. How formally should the translations address the reader?

**From task 4-6** (generating Arabic, Turkish, Russian).

The German menus use the informal "du". Each new language has its own convention.

- **Polite plural in Turkish and Russian, the ordinary singular in Arabic** *(Recommended)*:
  "siz" and "вы", which adult learners expect from an official-feeling tool, and "أنت",
  which is how Arabic apps address one reader.
- **Informal everywhere**: "sen" and "ты", matching the German "du". It reads as
  over-familiar to many adult Turkish and Russian speakers.

**Taken: the polite forms.** It matches what each language's own apps do, and a reviewer can
switch it with one search-and-replace if they disagree.

## 2. Should a place name the check flags as "untranslated" be translated anyway?

**From task 5** (Turkish), found while checking task 6.

The check flagged "Mecklenburgische Seenplatte", a district's proper name, as left in
English, because it is identical in the English source. One translator then invented a
Turkish name for it to make the warning go away.

- **Keep proper names as German and fix the check** *(Recommended)*: a string identical in
  the German and the English is a name, so the check now lets it through. The learner sees
  the name the exam uses.
- **Translate every flagged name**: makes the warning go away, but invents names that exist
  nowhere and that a learner would never meet in the exam.

**Taken: keep the German names, fix the check.** The check still catches a sentence left in
English, because a sentence differs between the German and the English. The district name is
back in German in the Turkish file.

## 3. Should the landing page stop saying "In German or English" now?

**From task 8** (translations in the quiz).

Four landing-page lines (`hero.lead`, `footer.blurb`, `why.3.body`, `stats.3`) say the app is
in German or English. With the new languages built but hidden, that is still what a visitor
can use.

- **Leave them until a language is released** *(Recommended)*: the claim stays true on the
  live site, and the plan does not cover marketing copy.
- **Rewrite them now** to mention more languages: the site would promise languages no
  visitor can pick yet.

**Taken: leave them.** When the first language is released (task 14), these four strings
and the "2 languages" figure in the numbers band need rewording in every language file.

## 4. Task 10 is all browser measurements. Mark it done, or leave it blocked?

**From task 10** (measure every language at every width).

The run may not open a browser, and task 10 consists only of on-screen measurements at
320-1400px. Task 12 (ship stage 1) and everything after it depend on task 10.

- **Leave it blocked, with a text-length list of where to look first** *(Recommended)*:
  nothing is claimed that was not measured. Tasks 12-17 wait for you.
- **Mark it done on the text-length list alone**: unblocks the rest, but it would record a
  measurement nobody made, and a header that overflows at 320px could reach the live site.

**Taken: leave it blocked.** The plan's own rule is that a string is shortened only when a
measurement says so. Task 11 (review sheets) does not depend on it and was done.

## 5. While only English and German are released, should the language box still open a list?

**From the wrap-up review.**

The EN box used to flip between English and German in one click. It now opens a list, which
for two languages costs a second click. `CLAUDE.md` once argued against exactly that.

- **Keep the list** *(Recommended)*: one control that already works for any number of
  languages, and a preview link to show reviewers. The extra click lasts only until the
  first language is released.
- **Flip while only two are offered**: saves the click today, but adds a second behaviour to
  build, test and later remove.

**Taken: keep the list.** Nothing was changed for this; tell me if you want the flip back.

## 6. Two small text changes reach English and German users. Keep them?

**From the wrap-up review.**

The plan promised no change for English and German users, and two texts did change:
the translate button now says "Show translation" rather than "Show the English", and the
"nothing to review yet" alert now speaks the menu language instead of always German.

- **Keep both** *(Recommended)*: the first names what the button now does in every
  language, and the second fixes a German-only message you asked to fold into task 7.
- **Revert the button text for English and German**: keeps "Show the English" there, at the
  cost of two different names for one button.

**Taken: keep both.**

## 7. How formally should the other seven languages address the reader?

**From task 15** (terminology lists for the other seven), second unattended run, 2026-10-12.

Question 1 settled this for Arabic, Turkish and Russian. The same choice comes up again for
seven more languages.

- **Each language's usual register for an official tool** *(Recommended)*: polite "شما"
  (Persian), "ви" (Ukrainian), "ju" (Albanian), "vi" (Bosnian/Croatian/Serbian),
  "dumneavoastră" (Romanian) and "hûn" (Kurmanji). Polish uses the informal "ty", or
  no direct address where that reads naturally. Polish apps and gov.pl services do this.
  The polite "Pan/Pani" is gendered and reads stiffly in buttons.
- **Polite everywhere, Polish included**: one rule for every language, but Polish menus
  would read like a formal letter.
- **Informal everywhere**: matches the German "du", but reads as over-familiar in most of
  these languages.

**Taken: each language's usual register.** It follows the reasoning of question 1, and a
reviewer can change it with a search-and-replace.

## 8. Which form of Bosnian, Croatian and Serbian does the one `bs` text use?

**From task 15.**

The design settles on one Latin-script text for all three. The three standards differ in
some words and in how a few vowels are written.

- **Bosnian, ijekavian, with words that Croatian shares wherever possible** *(Recommended)*:
  Bosnian sits between the other two. Serbian readers understand ijekavian, and Serbian's
  Latin script is official.
- **Croatian**: equally readable, but its purist vocabulary sounds foreign to many Bosnian
  and Serbian readers.
- **Serbian, ekavian**: its spelling differs most from the other two.

**Taken: Bosnian, ijekavian.** The list notes the Croatian or Serbian word beside a key term
where the three differ. The design's open question on whether one text serves all three
readers stays open until the reviews come back.

## 9. The plan's progress table had three rows pasted onto its first line. Repair it?

**From task 15**, found while reading the plan.

The newer, browser-checked versions of rows 7, 8 and 9 were on line 1, run together
before the title. The older versions were still in the table.

- **Move the three rows into the table, replacing their older versions** *(Recommended)*:
  this keeps the newer "browser-checked" wording and restores the title to line 1.
- **Leave it**: the plan opens with an unreadable line.

**Taken: moved.** Nothing in the rows was reworded.

## 10. Place names in a non-Latin language: keep the German spelling, or write them in the language's own script?

**From task 16** (generating the other seven).

My instructions to the translators said to keep place names as written. In Ukrainian that
left district and party names such as "Neckar-Odenwald-Kreis" and "Bündnis 90/Die Grünen"
in Latin letters. The completeness check then flagged 44 strings as mostly not in Cyrillic.
Persian hit the same problem in 9 strings.

- **Write them in the language's own script, as Arabic and Russian already do**
  *(Recommended)*: "Неккар-Оденвальд-Крайс", "اتحاد 90/سبزها". The learner can read the
  name, and all ten languages handle names the same way. Party abbreviations (CDU, SPD)
  stay in Latin letters.
- **Loosen the check for names**: the German spelling stays, but the check would stop
  catching real untranslated text. Weakening a check to make it pass is not something this
  run does.
- **Keep the German spelling in brackets after a transliteration**: both spellings appear,
  but long names push the string back under the script check's threshold.

**Taken: the language's own script.** Ukrainian was redone by a fix pass that followed
Russian's spellings. The nine Persian strings were fixed by hand, matching Arabic. Both files
now pass with no problems.

## 11. The general questions named the states differently from each language's state list. Harmonise them?

**From task 16.**

Each language's interface, general questions and state questions were translated in
separate batches. In Albanian, Bosnian/Croatian/Serbian and Romanian, the general questions
(mostly Q192-Q201, "which state was part of the GDR") kept German state names such as
"Bayern", while the state list says "Bavaria" or "Bavarska". The picker and the state
questions would then call a state one thing and the history questions another.

- **Use the state list's name everywhere** *(Recommended)*: one name per state in each
  language. Every replaced name was an answer option or a sentence's subject, so no
  grammatical case had to change.
- **Leave them**: German names in the history questions, local names everywhere else.

**Taken: the state list's name everywhere.** 41 names were replaced by script. This
exposed one giveaway, which I also fixed: Q25 asks which is *not* a German state, and its
right answer, "Elsass-Lothringen", was now the only German name among the options in
Romanian and Albanian. It is "Alsacia-Lorena" and "Alsaca-Lorena" now.
