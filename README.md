# Wedding E-Card + RSVP

React/Vite + GitHub Pages + Supabase PostgreSQL/Auth/API. ไม่มีโฆษณาในหน้าเว็บ

## เริ่มทดลองในเครื่อง

ใช้ Node.js 24 และ pnpm 11.19.0:

```sh
pnpm install
pnpm dev
```

เปิด URL ที่แสดงใน terminal (ปกติ http://127.0.0.1:5173/) และเปิด `#/admin` สำหรับแดชบอร์ด

หากยังไม่มีค่า Supabase การพัฒนาในเครื่องจะใช้โหมดทดลอง: ข้อมูล RSVP อยู่ใน localStorage ของเบราว์เซอร์นั้นเท่านั้น ไม่ได้ส่งถึงผู้จัดงาน และแอดมินทดลองไม่ต้องล็อกอิน ข้อมูลทดลองแยกจากข้อมูลจริง เมื่อ build production โดยไม่ตั้งค่า Supabase จะปิดรับ RSVP และปิดแอดมินแทนการใช้ข้อมูลทดลอง

คำสั่งตรวจสอบ:

```sh
pnpm test
pnpm build
pnpm preview
```

## ความสามารถรุ่นแรก

- E-Card responsive ธีมขาว/ครีม/ทอง พร้อมภาพคู่การ์ตูนในกรอบโค้ง ตัวนับถอยหลัง กำหนดการ dress code และบันทึกลงปฏิทิน
- แกลเลอรีการ์ดจริงทั้ง 2 หน้า กดขยาย/ซูม สลับหน้าด้วยปุ่มหรือลูกศร และดาวน์โหลด PDF ต้นฉบับ
- แอนิเมชันเบา ๆ เคารพการตั้งค่าลดการเคลื่อนไหว; ดูที่มาภาพและ prompt ที่ใช้ใน ASSETS.md
- แบบฟอร์มชื่อ เข้าร่วม/ไม่เข้าร่วม ฝั่งเจ้าภาพ กลุ่ม รายละเอียดกลุ่ม จำนวนคน โทรศัพท์ อีเมล และ Remark
- ปฏิเสธการเข้าร่วมแล้วจำนวนเป็น 0; ตรวจสอบข้อมูลทั้งหน้าเว็บ gateway และฐานข้อมูล
- บันทึก/แก้ไขคำตอบจากเบราว์เซอร์เดิมด้วยรหัสสุ่ม 256 บิต ไม่ใช้ชื่อหรือเบอร์โทรเป็นสิทธิ์แก้ไข
- กันส่งซ้ำด้วย receipt เดิม: การ retry หรือส่งพร้อมกันไม่สร้างรายการซ้ำ
- แอดมินล็อกอินด้วย Supabase Auth และตรวจสิทธิ์จาก admin_users
- สรุปจำนวนคน/รายการ แยกฝั่งและกลุ่ม ค้นหา กรอง เพิ่ม แก้ไข ลบ และส่งออก CSV เปิดด้วย Excel ได้
- QR Code สำหรับแชร์การ์ดทั้งงาน (ไม่ใช่ QR เฉพาะบุคคล)
- GitHub Actions สำหรับ build/test/deploy; ใช้ hash URL เพื่อรองรับการ refresh บน GitHub Pages และ relative assets สำหรับ project subpath

ตัวเลือกในสเปกที่ยังไม่เปิดใช้: รายชื่อเชิญล่วงหน้า, Guest Code/QR เฉพาะบุคคล, สรุปผู้ยังไม่ตอบ, กำหนดจำนวนสูงสุดรายคน, วันปิดรับ RSVP และส่งอีเมลยืนยัน ส่วน export เป็น CSV ไม่ใช่ไฟล์ .xlsx

## เปลี่ยนข้อมูลงาน

### เพิ่มรูป Pre-wedding ภายหลัง

วางรูป JPG/JPEG/PNG/WebP/AVIF ใน `src/assets/prewedding/` โดยตรง ตั้งชื่อ `01.jpg`, `02.jpg` เป็นต้น เว็บจะเรียงและนำเข้ารูปอัตโนมัติเมื่อ build/deploy ใหม่ ไม่ต้องแก้รายการรูปในโค้ด รองรับภาพแนวตั้งและแนวนอน มีปุ่มดูเพิ่มครั้งละ 6 รูป เปิดรูปเต็ม เลื่อนด้วยปุ่ม ลูกศรคีย์บอร์ด หรือปัดบนมือถือ ปิดด้วย Escape ได้

ระหว่างไม่มีรูป แสดงข้อความ “ความทรงจำของเรา…เร็ว ๆ นี้” โดยไม่ใส่รูปสมมติ ระบบนี้เป็นแกลเลอรีจากไฟล์ในโปรเจกต์ ยังไม่มีปุ่มอัปโหลดภาพจากหน้าแอดมิน ดูคำแนะนำขนาดภาพใน `src/assets/prewedding/README.md`

### รายละเอียดคำเชิญ

แก้ `src/config.js`: ชื่อบ่าวสาว วัน/เวลา สถานที่ แผนที่ ข้อความเชิญ ช่องทางติดต่อ และสี dress code ปัจจุบันใช้ข้อมูลจากการ์ดจริงและตั้ง `isSample: false` แล้ว

ข้อมูลปัจจุบันถอดจากภาพการ์ดหน้า/หลังใน `Card/`: มิ่งกมล ชื่นสว่าง และยุทธกิจ เกื้อศิริเกียรติ วันที่ 28 พฤศจิกายน 2569 โรงเรียนตำรวจตระเวนชายแดนบ้านหางแมว จันทบุรี พร้อมชื่อเจ้าภาพ กำหนดการ และแผนที่ Dress code ขาว/ครีม/ทองเป็นข้อมูลที่ผู้ใช้ยืนยันเพิ่มเติม

ไฟล์ `start` ใช้ timezone +07:00; `end: null` เพราะการ์ดไม่ระบุเวลาจบ ปฏิทินจึงส่งออกเฉพาะเวลาเริ่มโดยไม่สมมติเวลาจบ ช่องทางติดต่อยังไม่ระบุ ลวดลายใบไม้เป็น SVG ที่วาดในโค้ด สามารถเพิ่มรูปจริงภายหลัง

## ตั้งค่า Supabase

1. สร้าง Supabase project และเก็บ project URL กับ publishable key
2. รัน `supabase/migrations/202609070001_initial.sql` ครั้งเดียวใน SQL Editor ของ project ใหม่ หรือใช้ Supabase CLI migration
3. สร้างผู้ใช้แอดมินใน Authentication → Users และยืนยันอีเมลบัญชี จากนั้นเพิ่ม UUID ของผู้ใช้นั้นใน SQL Editor:

```sql
insert into public.admin_users (user_id) values ('ADMIN-USER-UUID');
```

แค่มีบัญชี Auth ยังไม่ทำให้เป็นแอดมิน ปิด public signups หากไม่ต้องการให้บุคคลทั่วไปสร้างบัญชี (แขกไม่ต้องมีบัญชี)

4. สร้าง Cloudflare Turnstile widget สำหรับ hostname ของ GitHub Pages เพื่อป้องกัน bot (ใช้เฉพาะ CAPTCHA; เว็บไซต์ยัง host ที่ GitHub Pages) ใส่ localhost เพิ่มเฉพาะเมื่อทดสอบระบบจริงในเครื่อง
5. ตั้ง Edge Function secrets ผ่าน Supabase Dashboard หรือ CLI: `TURNSTILE_SECRET_KEY` และ `ALLOWED_ORIGINS` เช่น `https://YOUR-NAME.github.io` (ไม่มี path และไม่มี slash ปิดท้าย) หากมีหลาย origin คั่นด้วย comma
6. Deploy `supabase/functions/public-rsvp/index.ts`:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy public-rsvp
```

`supabase/config.toml` กำหนด `verify_jwt = false` เพราะแขกไม่ได้ล็อกอิน; gateway ตรวจ CAPTCHA ก่อนใช้ service-role เรียก RPC และไม่เปิด public RPC เขียนฐานข้อมูลโดยตรง คีย์ `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ของ Edge Function เป็น environment ที่ Supabase จัดเตรียมให้ ห้ามนำ service-role หรือ Turnstile secret ใส่ frontend/repository

7. สำหรับ local development คัดลอก `.env.example` เป็น `.env.local` และใส่ค่า:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_SITE_KEY
```

หยุดและเริ่ม dev server ใหม่หลังเปลี่ยน environment ตัวแปร VITE_* ถูกเปิดเผยในเว็บเสมอ ใช้ได้เฉพาะ public keys

## เผยแพร่ด้วย GitHub Pages

1. สร้าง GitHub repository และนำโค้ดขึ้น branch `main` (GitHub Free ใช้ Pages กับ public repository)
2. Settings → Pages → Source เลือก **GitHub Actions**
3. Settings → Secrets and variables → Actions → **Variables** เพิ่มตัวแปร VITE ทั้งสามตามด้านบน (เป็น public configuration ไม่ใช่ secret)
4. Push ไป `main` หรือสั่ง Run workflow ใน Actions; `.github/workflows/deploy.yml` จะติดตั้ง ทดสอบ build และ deploy โฟลเดอร์ `dist`
5. เปิด URL Pages ที่ workflow คืนมา และตรวจให้ ALLOWED_ORIGINS/Turnstile ตรง hostname
6. หากเพิ่ม custom domain ให้ตั้ง DNS และ Pages custom domain, เปิด Enforce HTTPS และเพิ่ม origin/hostname ใหม่ใน Supabase และ Turnstile ค่าจดโดเมนเป็น optional แยกต่างหาก

Frontend ไม่ต้องใช้ server หรือ Cloudflare Pages มีเฉพาะ Supabase Edge Function สำหรับบันทึก RSVP ที่ผ่าน CAPTCHA

## ข้อมูลและการดูแล

- RLS ปิดการอ่านรายชื่อสำหรับบุคคลทั่วไปและผู้ใช้ Auth ที่ไม่ใช่แอดมิน; ตาราง private เก็บ hash ของรหัสแก้ไข ไม่เก็บ token ตัวจริง
- คำตอบเดิมและรหัสแก้ไขเก็บในเบราว์เซอร์แขก การล้างข้อมูล/เปลี่ยนเครื่องจะทำให้แก้ไขเองไม่ได้ ให้ติดต่อผู้จัดงานแทน หากแชร์เครื่องควรระวังการใช้คำตอบเดิม
- CSV ส่งออกตามตัวกรองปัจจุบัน มี UTF-8 BOM และป้องกันสูตรจากค่าที่ผู้ใช้กรอก
- Supabase Free อาจ pause หลังใช้งานน้อยในช่วง 7 วัน ต้อง restore จาก dashboard; หน้า E-Card ยังเปิดได้ แต่ RSVP ใช้ไม่ได้จน restore เสร็จ ไม่ใช่ระบบ wake-on-request
- สำรอง CSV ก่อนวันงาน ตรวจโควตา/สถานะฐานข้อมูล และกำหนดเวลาลบข้อมูลหลังงาน
- แบบฟอร์มทั่วไปไม่ได้จำกัดจำนวนคำตอบต่อบุคคลจริง; CAPTCHA ลด bot ส่วน token ป้องกันรายการซ้ำเฉพาะเบราว์เซอร์/คำตอบนั้น หากต้องคุมรายชื่อเชิญให้เพิ่ม Guest Code ตามสเปก
- ก่อนเชิญแขกจริง ต้องทดสอบการส่งและแก้ไขผ่าน Supabase ที่ deploy แล้ว รวมทั้ง admin login และ export ขณะนี้การทดสอบฐานข้อมูลในเครื่องไม่แทนการตรวจระบบ cloud จริง

## เอกสารทางการ

- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages)
- [Vite static deployment](https://vite.dev/guide/static-deploy)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Turnstile server-side verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
