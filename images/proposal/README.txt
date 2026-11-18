Proposal photos
===============
1. Drop your JPG files into this folder (images/proposal/).
   Tip: resize to about 1600px on the long edge, under ~400 KB each.
2. Open script.js and list the filenames in the PROPOSAL_PHOTOS array
   at the top. The carousel always shows them in filename order
   (1.jpg, 2.jpg, ... 10.jpg), whatever order you list them in:
     var PROPOSAL_PHOTOS = [
       "1.jpg",
       "2.jpg",
       { file: "3.jpg", alt: "What the photo shows", caption: "Optional caption" },
     ];
   A plain filename is enough. Use the object form to add proper alt text
   and a caption. Photos are shown whole, never cropped.
3. Save. Until the array has filenames, the page shows "Photo coming soon"
   placeholder slides. A listed file that is missing also falls back to one.

Phone-sized copies (optional, saves data on phones)
   sm/ holds smaller copies with the same file names (about 760px wide for
   portrait photos, 1080px for landscape). Make one on a Mac with:
     sips -s format jpeg -s formatOptions 72 --resampleWidth 760 7.jpg --out sm/7.jpg
   then add both widths to the photo's entry in script.js:
     { file: "7.jpg", alt: "...", width: 1500, small: 760 }
   Without width/small the full-size file is used.

cover.jpg is the hero cover photo (set in index.html, class="hero__photo")
and is not part of the carousel.
The envelope collage on the opening screen uses 2.jpg (oval frame) and
4.jpg (black-and-white polaroid), with their sm/ copies.
