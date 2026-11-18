Proposal photos
===============

1. Drop your JPG files into this folder (images/proposal/).
   Tip: resize to about 1600px on the long edge, under ~400 KB each.
2. Open script.js and list the filenames in the PROPOSAL_PHOTOS array
   at the top, in the order you want them shown:

     var PROPOSAL_PHOTOS = [
       "proposal-01.jpg",
       "proposal-02.jpg",
       { file: "proposal-03.jpg", alt: "What the photo shows", caption: "Optional caption" },
     ];

   A plain filename is enough. Use the object form to add proper alt text
   and a caption.
3. Save. Until the array has filenames, the page shows "Photo coming soon"
   placeholder tiles. A listed file that is missing also falls back to a tile.

Edit the story text in index.html (id="proposalStory").
