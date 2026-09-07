# Wedding website artwork

## Original invitation (unchanged artwork)

- `public/images/card-front.webp`: encoded from `Card/Wedding_Front_5x7_3mm_Bleed_300dpi.png` at original dimensions.
- `public/images/card-back.webp`: encoded from `Card/Wedding_Back_5x7_3mm_Bleed_300dpi.png` at original dimensions.
- `public/images/wedding-invitation.pdf`: exact copy of `Card/Wedding_5x7_Front_Back_3mm_Bleed.pdf`, downloadable from the gallery.

WebP compression reduces page-transfer size; no cropping, rewriting or retouching of invitation text, images or QR code. Source files in Card are preserved.

## Couple illustration for the hero

Saved asset: `public/images/couple-ivory.webp`.

Prepared with the built-in imagegen tool, using the back of the supplied card as the reference/edit target. This is an AI-prepared adaptation of the original couple illustration, not a pixel-exact crop. The original two cards displayed in the gallery remain unchanged.

The first extraction returned a visible checkerboard instead of transparency, so that intermediate image is not used. The final image uses a solid ivory background and is encoded as WebP without additional retouching.

Final prompt (built-in imagegen, edit mode):

> Use case: precise-object-edit. Edit this image. Replace ONLY the gray and white checkerboard background with a completely uniform warm ivory background, exact color #FAF6EE. No checkerboard anywhere, no transparency. Preserve the existing bride and groom illustration absolutely unchanged: same faces, glasses, hair, checked gray suit, white bridal dress and long train, shoes, bouquet, pose and all detail. Center the full-body couple and reduce the excessive top/bottom empty margins, fill 90% of portrait frame height while leaving shoes and dress unclipped. This is a wedding website editorial illustration. No text, no new plants or objects, no shadows, no background scenery.

Initial extraction prompt:

> Use case: background-extraction. Asset type: transparent cutout illustration for this couple's wedding website hero. Image 1 is the EDIT TARGET, their existing wedding invitation. Extract ONLY the original illustrated bride and groom together, full body, groom on left, bride on right, preserving their exact cute faces, glasses, black hair, gray checked suit, white bridal gown, veil, bouquet, poses, and proportions as closely as possible. Remove ALL invitation text, QR code, school background, flag, circular photo backdrop, and decorative outer plants. Keep the couple intact including the full dress train, shoes, hair and bouquet. Truly transparent alpha background, no opaque white rectangle and no checkerboard drawing. Center full couple cutout in a portrait canvas with modest transparent margins. Refine cutout edges but do not redesign the characters. No text, no lettering, no added objects.

## Interaction and theme

White, cream and antique gold across guest pages and admin. The live countdown uses the configured event start time. Two-page native-dialog viewer supports zoom, keyboard arrows, Escape, focus restoration and PDF download. Decorative animation and scroll reveals respect `prefers-reduced-motion`. The three web images total approximately 645 KB; the 4 MB PDF loads only when requested.
