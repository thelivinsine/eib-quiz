# Image Upload Staging Area

Drop the source image (any format) into the matching subfolder.
Each subfolder is named `Q<id>-<description>`.
For questions with multiple image options, there are sub-subfolders named
`option<N>-<description>`. The "correct" answer option is marked with `-correct`.

Once uploaded, Claude will rename/convert and move them to the final paths
expected by `questions.json`.

## General Questions

| Folder | What to upload |
|--------|---------------|
| `Q21-wappen-bundesrepublik/option1-reichswappen-weimar` | Weimar Republic coat of arms |
| `Q21-wappen-bundesrepublik/option2-bundeswappen-correct` | **Federal Republic coat of arms (correct answer)** |
| `Q21-wappen-bundesrepublik/option3-wappen-kaiserreich` | German Empire coat of arms |
| `Q21-wappen-bundesrepublik/option4-wappen-preussen` | Kingdom of Prussia coat of arms |
| `Q55-reichstag-photo` | Photo of the Reichstag building (webp preferred) |
| `Q209-wappen-ddr/option1-emblem-udssr` | USSR state emblem |
| `Q209-wappen-ddr/option2-emblem-polen` | Poland state emblem |
| `Q209-wappen-ddr/option3-emblem-tschechoslowakei` | Czechoslovakia state emblem |
| `Q209-wappen-ddr/option4-emblem-ddr-correct` | **DDR state emblem (correct answer)** |
| `Q226-flagge-eu/option1-flag-un` | United Nations flag |
| `Q226-flagge-eu/option3-flag-nato` | NATO flag |
| `Q311-wappen-berlin/option1-wappen-hamburg` | Hamburg coat of arms |
| `Q311-wappen-berlin/option2-wappen-bremen` | Bremen coat of arms |
| `Q311-wappen-berlin/option3-wappen-brandenburg` | Brandenburg coat of arms |
| `Q311-wappen-berlin/option4-wappen-berlin-correct` | **Berlin coat of arms (correct answer)** |
| `Q318-map-berlin/option1-map-bayern` | Germany map highlighting Bavaria |
| `Q318-map-berlin/option2-map-nrw` | Germany map highlighting NRW |
| `Q318-map-berlin/option3-map-sachsen` | Germany map highlighting Saxony |
| `Q318-map-berlin/option4-map-berlin-correct` | **Germany map highlighting Berlin (correct answer)** |

## State Questions (15 states x 2 questions each)

Each state has two questions:
- **Wappen (Q*x*1):** "Which coat of arms belongs to [state]?" — 4 option images of different coats of arms
- **Map (Q*x*8):** "Which state is [state]?" — 4 option images of Germany maps with different states highlighted

| State | Wappen folder | Map folder |
|-------|--------------|------------|
| Baden-Württemberg | `Q321-wappen-Baden-Wuerttemberg/` | `Q328-map-Baden-Wuerttemberg/` |
| Bayern | `Q331-wappen-Bayern/` | `Q338-map-Bayern/` |
| Brandenburg | `Q341-wappen-Brandenburg/` | `Q348-map-Brandenburg/` |
| Bremen | `Q351-wappen-Bremen/` | `Q358-map-Bremen/` |
| Hamburg | `Q361-wappen-Hamburg/` | `Q368-map-Hamburg/` |
| Hessen | `Q371-wappen-Hessen/` | `Q378-map-Hessen/` |
| Mecklenburg-Vorpommern | `Q381-wappen-Mecklenburg-Vorpommern/` | `Q388-map-Mecklenburg-Vorpommern/` |
| Niedersachsen | `Q391-wappen-Niedersachsen/` | `Q398-map-Niedersachsen/` |
| Nordrhein-Westfalen | `Q401-wappen-Nordrhein-Westfalen/` | `Q408-map-Nordrhein-Westfalen/` |
| Rheinland-Pfalz | `Q411-wappen-Rheinland-Pfalz/` | `Q418-map-Rheinland-Pfalz/` |
| Saarland | `Q421-wappen-Saarland/` | `Q428-map-Saarland/` |
| Sachsen | `Q431-wappen-Sachsen/` | `Q438-map-Sachsen/` |
| Sachsen-Anhalt | `Q441-wappen-Sachsen-Anhalt/` | `Q448-map-Sachsen-Anhalt/` |
| Schleswig-Holstein | `Q451-wappen-Schleswig-Holstein/` | `Q458-map-Schleswig-Holstein/` |
| Thüringen | `Q461-wappen-Thueringen/` | `Q468-map-Thueringen/` |

## Source

Official BAMF catalogue with original images:
https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html
