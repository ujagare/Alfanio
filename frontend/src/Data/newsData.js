import constroImage1 from '..\assets\alafa-images\Constro 2023.jpeg';
import constroImage2 from '..\assets\alafa-images\(10).webp';
import constroImage3 from '..\assets\alafa-images\(19).webp';
import southKorea from '..\assets\alafa-images\(9).webp';
import southKorea2 from '..\assets\alafa-images\(28).webp';
import southKorea3 from '..\assets\alafa-images\20211116_114205 (2).webp';
import southKorea4 from '..\assets\alafa-images\97843  (10).webp';
import usaVideo from '..\assets\videos\usa1.mp4';
import usa2 from '..\assets\videos\usa2.mp4';
import usa from '..\assets\alafa-images\usa.jpeg';
import whitePump from '..\assets\alafa-images\White-Pump.webp';
import heighRisePump from '..\assets\videos\heigh-rise pump.mp4';
import heighRisePump3 from '..\assets\alafa-images\(23).webp';
import heighRisePump2 from '..\assets\alafa-images\IMG_20211119_115836 (6).webp';
import tier4 from '..\assets\videos\tier4.mp4';
import Tier5 from '..\assets\alafa-images\(24).webp';
import Tier6 from '..\assets\alafa-images\Remote.jpeg';
import first from '..\assets\videos\first in india.mp4';
import firstImage from '..\assets\alafa-images\IMG_20211119_115836 (6).webp';




export const newsData = [
  {
    id: 1,
    title: "Participation in CONSTRO 2023",
    date: "December 12, 2023",
    category: "Events",
    images: {
      hero: constroImage2,
      gallery: [
        constroImage1,
        constroImage3
      ]
    },
    excerpt: "Successfully participated in South Asia's largest construction equipment exhibition.<br<br/> />",
    content: "We participated in the CONSTRO 2023 held in Moshi Pune. The exhibition gave Alfanio a platform to Showcase their product range of Construction Equipment. The event was a big success with Alfanio gaining appreciation for the superior quality of products from customers."
  },
  {
    id: 2,
    title: "Export To South Korea Market",
    date: "March 15, 2024",
    category: "International Business",
    images: {
      hero: southKorea4,
      gallery: [
      ]
    },
    excerpt: "Alfanio expands global footprint with successful export of concrete pumps to South Korea.",
    content: "We specialize in exporting high-quality, reliable concrete pumps designed to meet the rigorous demands of South Korea's advanced construction sector. Understanding the Korean emphasis on efficiency and cutting-edge technology, our pumps are engineered for optimal performance and durability. We recognize the importance of swift delivery and seamless logistics in this fast-paced market and ensure timely shipments and comprehensive after-sales support. We are committed to navigating South Korea's import regulations and provide all necessary documentation, including accurate information for Personal Customs Clearance Codes (PCCC) for B2C shipments, ensuring a smooth and efficient import process. Partner with us to leverage our expertise and bring superior concrete pumping solutions to South Korea's thriving construction industry."
  },
  {
    id: 3,
    title: "Export To USA ",
    category: "Events",
    images: {
      hero: "/images/news/excon-hero.webp",
      gallery: [
        usa,
        whitePump
      ]
    },
    video: usaVideo,
    excerpt: "Successfully participated in South Asia's largest construction equipment exhibition.",
    content: "Alfanio started exporting concrete pumps to USA as a part of global export plan."
  },
  {
    id: 4,
    title: "Launched High-Rise Concrete Pump In Market ",
    category: "Events",
    images: {
      hero: "/images/news/excon-hero.webp",
      gallery: [
        heighRisePump3,
        heighRisePump2
      ]
    },
    video: heighRisePump,
    excerpt: "Successfully participated in South Asia's largest construction equipment exhibition.",
    content: "Introducing the [CPH70 HRX] High-Rise Concrete Pump: engineered for superior vertical performance, precision control, and maximum efficiency in high-rise construction"
  },
  {
    id: 5,
    title: "Launched  Concrete Pump With Tier4 Final Stage Engine And With Hydraulic Outiggers And Radio Remote ",
    category: "Events",
    images: {
      hero: "/images/news/excon-hero.webp",
      gallery: [
        Tier5,
        Tier6
      ]
    },
    video: tier4,
    excerpt: "Successfully participated in South Asia's largest construction equipment exhibition.",
    content: "The [CPH70 HRX] concrete pump now available. Equipped with a Tier 4 Final Stage engine, hydraulic outriggers, and radio remote, it delivers superior performance while meeting stringent environmental standards."
  },
  {
    id: 6,
    title: "First in India To Launch Concrete Pumps With Cummins Engine In India For Local And Globle Market ",
    category: "Events",
    images: {
      hero: "/images/news/excon-hero.webp",
      gallery: [
        firstImage,
      ]
    },
    video: first,
    excerpt: "Successfully participated in South Asia's largest construction equipment exhibition.",
    content: "We are proud to be the first in India to launch concrete pumps powered by Cummins engines, for both local and global markets. This milestone signifies our commitment to delivering robust and reliable solutions, setting a new standard for performance."
  },
  // ... similar structure for other news items
];