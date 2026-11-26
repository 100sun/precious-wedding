Proposal post (Instagram-style carousel + grid, see gallery.js)
===============================================================
Files here are web copies. Your full-size uploads are kept in
images/proposal-originals/ig-post/ (not committed to git).

Each item needs:
  N.jpg      1080px wide (carousel)
  sm/N.jpg   480px wide (grid tile)
A video also needs N.mp4; N.jpg is then its first frame.

Make them on a Mac (from the repo root), e.g. for photo 16:
  sips -s format jpeg -s formatOptions 80 --resampleWidth 1080 IN.png --out images/proposal/16.jpg
  sips -s format jpeg -s formatOptions 72 --resampleWidth 480  IN.png --out images/proposal/sm/16.jpg
Video (needs ffmpeg):
  ffmpeg -i IN.mov -vf scale=1080:-2 -an -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart images/proposal/16.mp4
  ffmpeg -ss 0.3 -i IN.mov -frames:v 1 -vf scale=1080:-2 -q:v 3 images/proposal/16.jpg
  ffmpeg -ss 0.3 -i IN.mov -frames:v 1 -vf scale=480:-2  -q:v 5 images/proposal/sm/16.jpg
Then add the file name to the POST list at the top of gallery.js, in post order.

The hero photo and the envelope keepsake photos live in images/keepsakes/.
