## ระบบเกมบนเว็บ — BeanCity Style + Discord Bot Integration

### ธีมและดีไซน์

- ธีมดาร์กไซเบอร์พังค์: พื้นหลังน้ำเงินเข้ม (#07111b) + สีมิ้นต์ (#5ffac8) เป็นสีหลัก
- ฟอนต์: Syne (หัวเรื่อง), Noto Sans Thai (เนื้อหา), Space Mono (ตัวเลข/สถิติ)
- Grid pattern overlay, glassmorphism cards, glow effects
- Responsive sidebar + topbar layout

### หน้าจอหลัก

**1. Login Screen**

- ปุ่มเข้าสู่ระบบด้วย Discord (Discord OAuth)
- แอนิเมชัน floating logo + gradient background

**2. Dashboard (หน้าหลัก)**

- สรุปสถิติ: เงิน, EXP, เลเวล, อันดับ
- กิจกรรมล่าสุด + แจ้งเตือน
- Progress bars สำหรับ EXP และ daily quests

**3. City Builder**

- กริด 5x5 สำหรับวางอาคาร
- โหมด: ดู / สร้าง / ย้าย / ลบ
- อาคารแต่ละชนิดมีเลเวล + รายได้ต่อชั่วโมง
- แผงขวา: รายละเอียดอาคาร, ร้านค้าสร้างอาคาร

**4. Inventory & Trading**

- รายการไอเทมที่มี พร้อม rarity tags
- ตลาดซื้อขายไอเทมระหว่างผู้เล่น
- ประวัติการซื้อขาย

**5. มินิเกม**

- กาชา (สุ่มไอเทม)
- ทอยลูกเต๋า / สล็อตเรียบง่าย
- Daily spin wheel

**6. Leaderboard & Profile**

- อันดับผู้เล่นตามเงิน/เลเวล/เมือง
- หน้าโปรไฟล์แสดงสถิติ + avatar จาก Discord

### Sidebar Navigation

- 🏠 หน้าหลัก
- 🏙️ เมืองของฉัน
- 🎒 กระเป๋าไอเทม
- 🏪 ตลาด
- 🎰 มินิเกม
- 🏆 อันดับ
- 👤 โปรไฟล์
- แสดงยอดเงิน + เลเวลที่ sidebar footer

### Backend (Lovable Cloud / Supabase)

- ตาราง: profiles, buildings, inventory, transactions, game_stats, daily_rewards
- Discord OAuth login ผ่าน Supabase Auth
- Edge Functions สำหรับ game logic (สร้างอาคาร, ซื้อขาย, มินิเกม)
- Row Level Security ตาม user

### การเชื่อมกับ Discord Bot

- Edge Function endpoint สำหรับบอทส่งข้อมูลเข้า/ออก (เช่น อัพเดตเงิน, ส่งรางวัล)
- Webhook endpoint รับคำสั่งจากบอท
- Edge Function สำหรับส่งแจ้งเตือนผ่าน Discord (ใช้ Bot Token ที่มี)

### Phase 1 (สร้างก่อน)

1. ธีม BeanCity + Layout (topbar, sidebar, main area)
2. Login ผ่าน Discord OAuth
3. Dashboard + ระบบเงิน/EXP พื้นฐาน
4. City Builder grid + ร้านค้าอาคาร

### Phase 2

5. Inventory + ตลาดซื้อขาย
6. มินิเกม (กาชา, daily spin)
7. Leaderboard
8. Discord Bot integration endpoints                        

แก้ตกแต่งพื้นหลังเป็นแนวชมพูขาว มีตัดชมพูเข้มๆ

ระบบ “วางตึกติดกันแล้วได้โบนัส” ซึ่งทำให้เกมมีมิติการจัดวาง ไม่ใช่แค่วางมั่ว ๆ

ใช้ `getNeighbors(r,c)` เพื่อดึงช่องบน/ล่าง/ซ้าย/ขวาที่ติดกัน แล้ว `calcIncome()` จะเอาไปคิดโบนัส

### โบนัสที่มีจริงใน logic

#### ถ้าเป็น `cafe`

- ติด `park` → ×1.10
- ติด `bakery` → ×1.15
- ถ้ารอบข้างมี `tree` อย่างน้อย 2 → ×1.05

#### ถ้าเป็น `house`

- ติด `cafe` → ×1.05
- ติด `park` → ×1.05

ดังนั้นรายได้รวมของเมืองไม่ได้มาจากตัวตึกเฉย ๆ แต่ขึ้นกับ layout ด้วย

### ฝั่ง UI โบนัส

แถบขวาแท็บ “โบนัส” แสดงคู่โบนัส เช่น

- Café × Park +10%
- Café × Bakery +15%
- House ใกล้ Café +5%
- Tree × House +3% (ยังไม่ใช้งาน)

น่าสังเกตว่าใน UI โชว์บางโบนัสที่ “active” และบางอัน “inactive” เพื่อให้ผู้เล่นเห็นว่าการจัดวางตอนนี้เปิดโบนัสอะไรอยู่

## ระบบโปรไฟล์ผู้เล่น

ในแถบซ้ายมีส่วนโปรไฟล์โชว์ข้อมูลผู้เล่น เช่น

- Level
- Prestige
- จำนวนตึก
- จำนวนสินค้าในร้าน
- EXP bar

## ระบบ leaderboard

มี data `LB` เป็นอันดับผู้เล่นพร้อมคะแนน/มูลค่าเมือง เช่น

- CaféKing
- MintCity
- BeanBuilder (ตัวเรา)  
ฯลฯ

### `renderLB()`

สร้างแถวอันดับทีละคน

- top 1–3 มีเหรียญ 🥇🥈🥉
- คนของเรา (`me:true`) มีดาวพิเศษ
- โชว์ชื่อเมือง
- โชว์คะแนนเป็นตัวเลขสวย ๆ

หน้า leaderboard ยังมี panel ข้าง ๆ ที่บอก

- อันดับเรา
- มูลค่าเมือง
- ขยับจากเมื่อวาน

## ระบบดูร้านของผู้เล่นอื่น

### `openVisitModal(item)`

เมื่อคลิกร้าน/สินค้าของคนอื่น

- เอาข้อมูลร้านนั้นขึ้น modal
- หา item ทั้งหมดที่ owner เดียวกัน
- แสดงเป็นเมนูร้านทั้งหมด
- ให้กดซื้อใน modal ได้เลย

นี่คือระบบ social/trading เบื้องต้นที่ทำให้ผู้เล่นไปส่องร้านคนอื่นได้

## ระบบตลาดกลาง (Marketplace)

ตลาดกลางใช้ data ชุด `MARKET_ITEMS` ซึ่งเป็นรายการสินค้าจากหลายเมือง/หลายเจ้าของ เช่น ตัวอย่าง

- ชา
- เค้ก
- boost
- decoration
- croissant ฯลฯ

แต่ละ item มี

- id
- icon
- name
- shop
- city
- price
- sold
- cat
- owner
- บางชิ้นมี `mine:true` ถ้าเป็นร้านเรา

### `renderMarket()`

จะกรองสินค้าตาม

- หมวดหมู่ (`marketFilter`)
- คำค้น (`marketSearch`)

แล้วสร้าง card สินค้าแต่ละใบ

- ถ้าเป็นของเรา ปุ่มซื้อจะ disabled
- ถ้าไม่ใช่ของเรา จะกดซื้อได้
- ถ้าคลิกการ์ดแต่ไม่กดปุ่มซื้อ จะเปิด modal ดูร้านเจ้าของคนนั้น

### `filterMarket(cat, btn)`

เปลี่ยนหมวดกรอง เช่น

- ทั้งหมด
- เครื่องดื่ม
- อาหาร
- ของตกแต่ง
- บูสต์

### `searchMarket(q)`

ตั้งค่าคำค้นแล้ว render ใหม่

### `buyItem(id)`

เวลาเราซื้อของ

- หา item จาก id
- เช็กเงินพอไหม
- หักเงินจาก wallet
- เพิ่มยอดขาย `sold++`
- อัปเดต UI
- อัปเดตเควสขายสินค้า
- render ตลาดใหม่

## ระบบร้านค้าในเมือง (Café / Shop Management)

นี่เป็นอีกระบบเด่นมากของไฟล์

### ตึกที่เปิดร้านได้

จาก data `BLDGS` ตอนนี้คือ

- café
- bakery

เมื่อคลิกตึกที่เปิดร้านได้ในหน้าเมือง จะเปิด `cafe-modal`

### ภายใน modal ร้านมี 4 ส่วนใหญ่

#### 1) สถิติร้าน

เช่น

- รายได้พื้นฐาน
- โบนัสรวม
- รายได้ร้านวันนี้
- จำนวนลูกค้า

#### 2) เมนูร้านของฉัน

มี slot สินค้า

- ชื่อสินค้า
- ราคา
- ยอดขาย
- ปุ่มลบ

#### 3) ฟอร์มเพิ่มสินค้า

มีช่องให้เลือก

- ไอคอนสินค้า
- ชื่อสินค้า
- ราคา
- จำนวนต่อวัน

#### 4) feed ลูกค้าล่าสุด + กราฟยอดขาย 7 วัน

- รายชื่อลูกค้าล่าสุด
- ซื้ออะไร ราคาเท่าไร
- เวลากี่นาทีที่แล้ว
- chart แท่งแบบง่าย

### `renderCaféModal(type,r,c)`

เอาไว้ populate modal ของร้านตามตำแหน่งที่กด แล้วเรียก

- `renderMyMenuSlots()`
- `renderVisitorFeed()`
- `renderSalesChart()`

### `renderMyMenuSlots()`

โชว์รายการสินค้าที่ร้านมีอยู่ พร้อม empty slot ถ้ายังไม่เต็ม

### `addProduct()`

ใช้ค่าจากฟอร์มเพิ่มสินค้าใหม่เข้าเมนูร้าน

- ตรวจว่ากรอกครบไหม
- ตรวจ slot เต็มไหม
- push item ใหม่เข้า array
- re-render รายการ
- toast แจ้งสำเร็จ

ระบบช่องกรอกโค้ดuiต่างๆสวยๆ