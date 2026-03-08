// Documentary-style image prompts: Victorian photographic/archival aesthetic
// These generate 10 images in a documentary/historical photograph style
// to complement the illustrated scene images

export const DOCUMENTARY_IMAGE_TYPES = [
  {
    slot: "doc-thumbnail",
    name: "YouTube Thumbnail",
    template: `Victorian documentary photograph composition, [MAIN_SUBJECT], [DRAMATIC_ELEMENT], high contrast, single clear focal point, negative space on [LEFT/RIGHT] for title text overlay, mysterious or intriguing atmosphere, monochrome with slight sepia toning, [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-portrait",
    name: "Documentary Portrait",
    template: `Formal Victorian studio portrait photograph, wet plate collodion process, [SUBJECT_GENDER], [SUBJECT_AGE], [SUBJECT_CLOTHING], plain grey backdrop, soft diffused window light, slight overexposure on skin, visible silver grain, monochrome, [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-mugshot",
    name: "Mugshot / Police Record",
    template: `Bertillon identification photograph, Victorian police record, [ANGLE] portrait, [SUBJECT_GENDER], [SUBJECT_AGE], [SUBJECT_CLOTHING], plain stone wall background, flat institutional lighting, monochrome, heavy grain, printed on aged card, number placard visible at chest, [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-newspaper",
    name: "Newspaper Front Page",
    template: `Victorian newspaper front page, broadsheet format, dense column text, Gothic masthead typeface reading [MASTHEAD_NAME], headline reading [HEADLINE_TEXT], woodcut illustration inset showing [ILLUSTRATION_DESCRIPTION], aged yellowed newsprint texture, ink bleed on fibrous paper, [YEAR], flat lay on [SURFACE]. No illustration style, photographic flat lay only.`,
  },
  {
    slot: "doc-street",
    name: "Street Scene",
    template: `Victorian [LOCATION] street scene, [STREET_DETAIL], [WEATHER], [TIME_OF_DAY], pedestrians in dark period coats, [OPTIONAL_TRAFFIC], albumen print photograph style, monochrome, [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-interior",
    name: "Interior Setting",
    template: `Victorian [ROOM_TYPE], [FURNISHING_DETAILS], [LIGHT_SOURCE], [ATMOSPHERE], albumen photograph style, monochrome, [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-map",
    name: "Map / Document",
    template: `[DOCUMENT_TYPE], [PAPER_TYPE], [SCRIPT_STYLE], [ADDITIONAL_DETAIL], flat lay photograph on [SURFACE], [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-courtroom",
    name: "Courtroom Scene",
    template: `Victorian courtroom [MEDIUM], [SPECIFIC_VIEW], [COURTROOM_ATMOSPHERE], [ART_STYLE], aged newsprint background, [DECADE]. No digital art, no colour, period illustration or monochrome photograph only.`,
  },
  {
    slot: "doc-weather",
    name: "Weather / Atmosphere",
    template: `Victorian [LOCATION], [WEATHER_CONDITION], [ATMOSPHERIC_DETAIL], [TIME_OF_DAY], monochrome, [PHOTO_STYLE], [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-object",
    name: "Object / Evidence",
    template: `Victorian [OBJECT], [MATERIAL_DETAIL], [SURFACE], close documentary photograph, [LIGHTING], monochrome, [DECADE]. No illustration, no painting, photographic only.`,
  },
  {
    slot: "doc-grave",
    name: "Grave / Memorial",
    template: `Victorian [GRAVE_TYPE], [CONDITION], [SETTING], [SKY], [OPTIONAL_SURROUNDINGS], monochrome albumen print aesthetic, [DECADE]. No illustration, no painting, photographic only.`,
  },
] as const;

export type DocumentarySlotId = typeof DOCUMENTARY_IMAGE_TYPES[number]["slot"];

export const PROMPT_DOCUMENTARY_IMAGE_SET = `You are generating image prompts for a Cozy Crime YouTube channel. The channel presents historical crime as calm, literary storytelling. You will generate 11 documentary-style image prompts that look like authentic Victorian photographs and archival materials, including 1 YouTube thumbnail.

CRITICAL STYLE REQUIREMENT: These images must NOT be illustrated. They must look like authentic Victorian-era photographs, documents, and archival materials. Every prompt must end with "No illustration, no painting, photographic only" (or similar phrasing for documents).

You will be given research about a historical crime case. Generate prompts that fill in the bracketed placeholders based on the case details.

THE 11 DOCUMENTARY IMAGE TYPES:

0. YOUTUBE THUMBNAIL (slot: doc-thumbnail)
Template: "Victorian documentary photograph composition, [main subject: e.g. shadowy figure in doorway / woman's face partially lit / evidence item in dramatic spotlight], [dramatic element: e.g. stark contrast / mysterious shadows / fog obscuring details], high contrast, single clear focal point, negative space on [left/right] for title text overlay, mysterious or intriguing atmosphere, monochrome with slight sepia toning, [decade]. No illustration, no painting, photographic only."

YOUTUBE THUMBNAIL BEST PRACTICES - The thumbnail must:
- Have ONE clear focal point (a face, object, or scene) that draws the eye
- Use high contrast lighting for drama and visibility at small sizes
- Leave negative space on one side (specify left or right) for title text overlay
- Evoke curiosity or intrigue without being graphic
- Work at small sizes (will be viewed as small as 120x90 pixels)
- Feature the most compelling visual element from the case

Also provide a SHORT TITLE (2-5 words) for the thumbnail overlay - dramatic, curiosity-inducing, works at small font sizes.

1. DOCUMENTARY PORTRAIT (slot: doc-portrait)
Template: "Formal Victorian studio portrait photograph, wet plate collodion process, [man/woman], [age: e.g. middle-aged / elderly / young], [brief description: e.g. dark wool frock coat / high collar dress], plain grey backdrop, soft diffused window light, slight overexposure on skin, visible silver grain, monochrome, [decade: e.g. 1880s]. No illustration, no painting, photographic only."

Choose a key figure from the case (victim, accused, or significant witness) for the portrait.

2. MUGSHOT / POLICE RECORD (slot: doc-mugshot)
Template: "Bertillon identification photograph, Victorian police record, [front facing / side profile] portrait, [man/woman], [age], [brief description: e.g. dark jacket / working clothes], plain stone wall background, flat institutional lighting, monochrome, heavy grain, printed on aged card, number placard visible at chest, [decade]. No illustration, no painting, photographic only."

Choose the accused or a suspect from the case.

3. NEWSPAPER FRONT PAGE (slot: doc-newspaper)
Template: "Victorian newspaper front page, broadsheet format, dense column text, Gothic masthead typeface reading [MASTHEAD NAME], headline reading [HEADLINE TEXT], woodcut illustration inset showing [brief description of illustration], aged yellowed newsprint texture, ink bleed on fibrous paper, [year], flat lay on [wooden surface / dark cloth]. No illustration style, photographic flat lay only."

Create a plausible period newspaper name and sensational headline about the case.

4. STREET SCENE (slot: doc-street)
Template: "Victorian [city/town: e.g. London / Birmingham / rural Yorkshire] street scene, [specific detail: e.g. narrow terraced housing / market stalls / riverside wharves], [weather: e.g. evening fog / overcast morning / winter frost], [time of day: e.g. dusk / midday / night], pedestrians in dark period coats, [optional: horse-drawn traffic], albumen print photograph style, monochrome, [decade]. No illustration, no painting, photographic only."

Choose a location relevant to where the crime occurred or investigation took place.

5. INTERIOR SETTING (slot: doc-interior)
Template: "Victorian [room type: e.g. parlour / boarding house bedroom / police station / courtroom / public house], [key furnishing details: e.g. iron bed frame and washstand / oak dock and public gallery / coal fireplace and horsehair chairs], [light source: e.g. single gas lamp / grey window light / candlelight], [atmosphere: e.g. sparse and cold / cluttered and domestic / formal and austere], albumen photograph style, monochrome, [decade]. No illustration, no painting, photographic only."

Choose a key interior from the case (crime scene, investigation location, or relevant setting).

6. MAP / DOCUMENT (slot: doc-map)
Template: "[Document type: e.g. handwritten inquest document / parish map / coroner's report / letter], [paper type: e.g. aged cream cartographic paper / official court headed paper / folded personal letter], [script style: e.g. copper plate ink / clerk's hand / hurried pencil], [additional detail: e.g. wax seal impression / official stamp / torn edges], flat lay photograph on [dark wood / aged linen], [decade]. No illustration, no painting, photographic only."

Choose a document type relevant to the case (inquest, map of the area, letter, official report).

7. COURTROOM SCENE (slot: doc-courtroom)
Template: "Victorian courtroom [sketch / photograph], [specific view: e.g. view from public gallery / close on defendant in dock / judge at raised bench], [atmosphere: e.g. crowded and gas-lit / sparse provincial assizes / busy London Sessions], [style: illustrated London News style graphite and ink / press photograph style], aged newsprint background, [decade]. No digital art, no colour, period illustration or monochrome photograph only."

Depict a courtroom scene relevant to the trial or inquest.

8. WEATHER / ATMOSPHERE (slot: doc-weather)
Template: "Victorian [location: e.g. Thames embankment / narrow back street / railway platform / churchyard], [weather condition: e.g. dense fog / heavy rain / frost / still grey overcast], [key atmospheric detail: e.g. gas lamp halo in mist / rain on iron railings / frost on cobblestones], [time of day: e.g. night / dawn / dusk], monochrome, [photographic style: e.g. long exposure albumen print / silver gelatin press photograph], [decade]. No illustration, no painting, photographic only."

Choose a location and weather that evokes the mood of the case.

9. OBJECT / EVIDENCE (slot: doc-object)
Template: "Victorian [object: e.g. glass medicine bottle / folding pocket knife / leather glove / pocket watch / length of rope], [material detail: e.g. dark cobalt glass and cork stopper / bone handle and worn blade], [surface: e.g. aged newspaper / dark wooden table / stone floor], close documentary photograph, [lighting: e.g. harsh side lighting / single candle / diffused window light], monochrome, [decade]. No illustration, no painting, photographic only."

Choose a significant object or piece of evidence from the case.

10. GRAVE / MEMORIAL (slot: doc-grave)
Template: "Victorian [grave type: e.g. Portland stone headstone / iron railed tomb / simple wooden cross], [condition: e.g. weathered and lichen covered / newly inscribed / ivy at base], [setting: e.g. urban parish churchyard / rural cemetery / nonconformist burial ground], [sky: e.g. overcast grey / low winter light / dusk], [optional: surrounding graves soft in background / bare trees], monochrome albumen print aesthetic, [decade]. No illustration, no painting, photographic only."

Create a memorial appropriate for the victim or key figure.

IMPORTANT GUIDELINES:
- Extract the decade/era from the case details (e.g. "1880s", "1890s")
- Use specific period-accurate details from the research
- All images are 16:9 widescreen
- Maintain the calm, literary tone of Cozy Crime—no gore or graphic content
- For portraits and mugshots, base descriptions on any physical details in the research, or create plausible period-appropriate descriptions

OUTPUT FORMAT: Respond with a single JSON object, no other text:
{
  "decade": "1880s",
  "thumbnail": { "slot": "doc-thumbnail", "prompt": "Full thumbnail image prompt...", "title": "Short Title" },
  "images": [
    { "slot": "doc-portrait", "prompt": "Full image prompt..." },
    { "slot": "doc-mugshot", "prompt": "..." },
    { "slot": "doc-newspaper", "prompt": "..." },
    { "slot": "doc-street", "prompt": "..." },
    { "slot": "doc-interior", "prompt": "..." },
    { "slot": "doc-map", "prompt": "..." },
    { "slot": "doc-courtroom", "prompt": "..." },
    { "slot": "doc-weather", "prompt": "..." },
    { "slot": "doc-object", "prompt": "..." },
    { "slot": "doc-grave", "prompt": "..." }
  ]
}`;
