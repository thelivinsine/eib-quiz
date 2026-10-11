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
