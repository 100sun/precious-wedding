Proposal photos
===============
1. Drop your JPG files into this folder (images/proposal/).
   Tip: resize to about 1600px on the long edge, under ~400 KB each.
2. Open script.js and list the filenames in the PROPOSAL_PHOTOS array
   at the top. The gallery always shows them in filename order
   (1.jpg, 2.jpg, ... 10.jpg), whatever order you list them in:
     var PROPOSAL_PHOTOS = [
       "1.jpg",
       "2.jpg",
       { file: "3.jpg", alt: "What the photo shows", caption: "Optional caption" },
     ];
   A plain filename is enough. Use the object form to add proper alt text
   and a caption. Photos are shown whole, never cropped.
3. Save. Until the array has filenames, the page shows "Photo coming soon"
   placeholder tiles. A listed file that is missing also falls back to a tile.
cover.jpg is the hero cover photo (set in index.html, class="hero__photo")
and is not part of the gallery.
Edit the story text in index.html (id="proposalStory").
