/** Artist-voice copy commissioned through the project owner. No personal health histories are asserted. */
export const artistStories = [
  {
    slug: "eno",
    artist: "ENO",
    id: 300,
    color: "#c8c8ce",
    title: "Finding a shape for the noise.",
    deck: "A monochrome study in intensity, expression and making room for what is difficult to say.",
    theme: "Expression without explanation",
    takeaway:
      "A pattern can carry a feeling without defining the person wearing it.",
    experience:
      "I start with the tension between a dense center and everything that moves around it. I’m interested in how an image can hold intensity without needing to explain it away. The pattern gives that energy somewhere to go.",
    pattern:
      "I bring the eye back to the central form, then let it travel through fine lines, pale breaks and dark ink fields. The contrast matters: some parts feel concentrated, others open. I want those different textures to stay in the same image.",
    support:
      "For me, support begins with making room for expression before asking for an explanation. Someone should be able to choose how much they share. I want the work to encourage that kind of openness, without turning a person into a label.",
  },
  {
    slug: "chaemin",
    artist: "CHAEMIN",
    id: 301,
    color: "#c8b6ec",
    title: "More than the face you show.",
    deck: "Layered portraits and flowing lines make space for the difference between being seen and being understood.",
    theme: "Being seen beyond appearances",
    takeaway: "Being visible should not mean having to explain everything.",
    experience:
      "I’m drawn to the difference between seeing a face and knowing a person. An expression is only one surface. I want the repeated portraits to invite a second look, rather than offer a complete answer at first glance.",
    pattern:
      "I use the flow of the hair to connect faces across the fabric. Lavender brings certain details forward, while deep teal lets other passages recede. Cropping keeps the portraits open: you see a fragment, but you know there is more beyond it.",
    support:
      "I want this collaboration to encourage curiosity instead of assumptions. Looking fine and feeling fine are not the same thing. To me, being supportive means leaving space for someone to speak in their own time, or to keep something private.",
  },
  {
    slug: "stacey-nah",
    artist: "STACEY NAH",
    id: 302,
    color: "#a7bed8",
    title: "A small shift in the everyday.",
    deck: "An ordinary city scene becomes a place to notice something unexpected, playful and personal.",
    theme: "Permission to move at your own pace",
    takeaway: "Small moments deserve space, too.",
    experience:
      "I look for the point where a familiar scene can become unfamiliar again. The street gives the image an everyday rhythm; the unexpected figures change how you look at it. I’m interested in that small shift of attention.",
    pattern:
      "I work with changes of scale: tiny figures, pale horses, street textures and cool blue light share one surface. The recognizable details keep the image grounded, while the unusual combinations make room for another reading.",
    support:
      "I want to make space for different ways of moving through the everyday. A small moment of attention can matter without becoming a grand transformation story. For this project, support means respecting someone’s pace and noticing what they choose to share.",
  },
  {
    slug: "velfont",
    artist: "VELFONT",
    id: 303,
    color: "#f0b943",
    title: "Making room for every layer.",
    deck: "Collage, gesture and blocks of color hold different emotional textures in the same frame.",
    theme: "Complexity without a single label",
    takeaway: "You can be more than one feeling at a time.",
    experience:
      "I don’t want the composition to settle into one clear mood. I’m interested in allowing different energies to stay visible together. Color can be direct, while a gesture or a fragment can remain unresolved.",
    pattern:
      "I place blue, yellow and orange next to darker gestural forms and fractured collage. Those elements cross the seams and interrupt one another. The image has more than one rhythm, and I want the garment to keep that movement.",
    support:
      "I want the work to make room for complexity. A person can hold mixed feelings without needing to reduce them to one word. This collaboration is a way to support that openness: listening without demanding a neat account of someone’s experience.",
  },
];
const image = (story, view = "front") =>
  `assets/refresh-20261117/underground-${story.slug}-${view}.png`;
export function storyCards() {
  return `<section class="artist-journal" id="artist-stories"><div class="journal-heading"><div><div class="eyebrow">SPANKY JOURNAL / UNDERGROUND VOICES</div><h2>Behind the pattern.<br><em>Room for the person.</em></h2></div><p>Four artists. Four creative perspectives.<br>Explore how artwork can make space for feeling, individuality and solidarity.</p></div><p class="journal-context">On the visual choices behind the work, the freedom to express a feeling, and making room for one another.</p><div class="journal-grid">${artistStories.map((story, i) => `<a class="journal-card ${i === 0 ? "journal-feature" : ""}" href="artist-${story.slug}.html" style="--story-color:${story.color}"><div class="journal-art"><img src="${image(story)}" alt="SPANKY × ${story.artist} collaboration artwork" width="1448" height="1086" loading="lazy"></div><div class="journal-card-copy"><div class="eyebrow">0${i + 1} / ${story.artist}</div><h3>${story.title}</h3><p>${story.deck}</p><span class="text-link">Explore story ↗</span></div></a>`).join("")}</div></section>`;
}
export function renderArtistStory(story) {
  const next =
    artistStories[(artistStories.indexOf(story) + 1) % artistStories.length];
  return `<article class="artist-article" style="--story-color:${story.color}"><div class="article-heading"><a class="text-link" href="world.html#artist-stories">← All artist stories</a><div class="eyebrow">SPANKY JOURNAL / ${story.artist} / ARTIST PERSPECTIVE</div><h1>${story.title}</h1><p class="article-deck">${story.deck}</p><p class="article-byline">${story.artist} · On expression, pattern and solidarity</p></div><figure class="article-art"><img src="${image(story)}" alt="SPANKY × ${story.artist}, front artwork" width="1448" height="1086"><figcaption>${story.artist} / THE PATTERN AS A PERSONAL CANVAS</figcaption></figure><div class="article-body">${[
    [
      "01 / THE STARTING POINT",
      "What is the idea behind this work?",
      story.experience,
    ],
    [
      "02 / THE VISUAL LANGUAGE",
      "How does that idea become a pattern?",
      story.pattern,
    ],
    [
      "03 / A GESTURE OF SOLIDARITY",
      "What does support mean in this collaboration?",
      story.support,
    ],
  ]
    .map(
      ([label, question, answer]) =>
        `<section class="artist-answer"><div class="eyebrow">${label}</div><h2>${question}</h2><div class="answer-byline">${story.artist}</div><p>${answer}</p></section>`,
    )
    .join(
      "",
    )}<p class="article-takeaway">${story.takeaway}</p></div><div class="article-product"><img src="${image(story, "back")}" alt="SPANKY × ${story.artist}, back artwork" width="1448" height="1086" loading="lazy"><div><div class="eyebrow">THE ARTWORK, CLOSE TO YOU</div><h2>SPANKY × ${story.artist}</h2><p>Discover the front and back of the collaboration design.</p><button class="button green" data-product="${story.id}">Explore the design ↗</button><a class="text-link" href="artist-${next.slug}.html">Next story / ${next.artist} ↗</a></div></div></article>`;
}
