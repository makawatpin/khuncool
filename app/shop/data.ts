export type Product = {
  cat: string;
  title: string;
  img: string;
  alt: string;
  rating: string;
  price: string;
  oldPrice: string;
  badge: string | null;
  reviewHref: string | null;
  buyHref: string;
};

export const TRUST_CHIPS = [
  "ทดลองใช้จริง",
  "ไม่รับสปอนเซอร์จัดอันดับ",
  "อัปเดตราคาเรื่อย ๆ",
];

export const CATS = [
  { t: "บอร์ด/ผนังห้องเรียน", bg: "#E1E3FD", color: "#3D38B4" },
  { t: "อุปกรณ์สอน", bg: "#D0FBEF", color: "#0A9380" },
  { t: "เครื่องเขียน", bg: "#FFEAD5", color: "#C2500B" },
  { t: "ของใช้ส่วนตัว", bg: "#F1F3F6", color: "#434A58" },
];

export const PRODUCTS: Product[] = [
  {
    cat: "บอร์ด/ผนังห้องเรียน",
    title: "กรอบป้ายติดผนังแม่เหล็ก",
    img: "/assets/magnet-frame-product.webp",
    alt: "กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง",
    rating: "4.8",
    price: "฿16",
    oldPrice: "฿329",
    badge: "ยอดนิยม",
    reviewHref: "/blog/magnetic-frame",
    buyHref: "#",
  },
  {
    cat: "เครื่องเขียน",
    title: "เครื่องเคลือบบัตรพกพา",
    img: "/assets/laminator-product.jpg",
    alt: "เครื่องเคลือบบัตรพกพาสำหรับครู",
    rating: "4.7",
    price: "฿450",
    oldPrice: "฿469",
    badge: null,
    reviewHref: null,
    buyHref: "#",
  },
  {
    cat: "อุปกรณ์สอน",
    title: "ขาตั้งโน้ตบุ๊กปรับระดับ",
    img: "/assets/laptop-stand-product.webp",
    alt: "ขาตั้งโน้ตบุ๊กปรับระดับสำหรับครู",
    rating: "4.6",
    price: "฿399",
    oldPrice: "฿590",
    badge: null,
    reviewHref: null,
    buyHref: "#",
  },
  {
    cat: "อุปกรณ์สอน",
    title: "ไมค์ลำโพงพกพาสำหรับครู",
    img: "/assets/mic-speaker-product.webp",
    alt: "ไมค์ลำโพงพกพาสำหรับครูสอนห้องใหญ่",
    rating: "4.9",
    price: "฿436",
    oldPrice: "฿1,190",
    badge: "แนะนำ",
    reviewHref: null,
    buyHref: "#",
  },
  {
    cat: "ของใช้ส่วนตัว",
    title: "กระบอกน้ำเก็บความเย็น",
    img: "/assets/tumbler-bottle-product.webp",
    alt: "กระบอกน้ำเก็บความเย็นสำหรับครู",
    rating: "4.7",
    price: "฿329",
    oldPrice: "฿599",
    badge: null,
    reviewHref: null,
    buyHref: "#",
  },
  {
    cat: "ของใช้ส่วนตัว",
    title: "กระบอกน้ำ Civago",
    img: "/assets/tumbler-civago-product.webp",
    alt: "กระบอกน้ำ Civago สำหรับครู",
    rating: "4.5",
    price: "฿324",
    oldPrice: "฿399",
    badge: null,
    reviewHref: null,
    buyHref: "#",
  },
];

export const FAQS = [
  {
    q: "สินค้าที่แนะนำเป็นลิงก์พันธมิตรหรือไม่",
    a: "ใช่ ลิงก์สั่งซื้อบางส่วนเป็นลิงก์พันธมิตร ทีมงานอาจได้รับค่าคอมมิชชันเมื่อคุณสั่งซื้อ โดยไม่มีค่าใช้จ่ายเพิ่มเติมจากคุณ",
  },
  {
    q: "คัดเลือกสินค้าอย่างไร",
    a: "ทีมงานเลือกจากอุปกรณ์ที่ครูใช้งานจริงในห้องเรียน เน้นความคุ้มค่า ทนทาน และใช้งานง่าย ไม่รับสปอนเซอร์เพื่อจัดอันดับ",
  },
  {
    q: "มีรีวิวแบบละเอียดไหม",
    a: "สินค้าบางชิ้นมีบทความรีวิวแบบละเอียดในหมวดบทความ กดที่ปุ่ม อ่านรีวิว บนการ์ดสินค้านั้น ๆ",
  },
];

/** Strip the ฿ symbol and thousands separators so JSON-LD offers derive from the same price shown on the card. */
export function priceToNumber(price: string): string {
  return price.replace(/[^\d.]/g, "");
}
