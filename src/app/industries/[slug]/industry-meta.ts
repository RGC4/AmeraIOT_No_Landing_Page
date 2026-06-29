export interface IndustryMeta {
  name: string;
  image: string;
  alt: string;
}

export const industryMeta: Record<string, IndustryMeta> = {
  manufacturing: {
    name: 'Manufacturing',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12e0ea91d-1766522162099.png',
    alt: 'Large industrial manufacturing plant with heavy machinery and assembly lines',
  },
  'oil-gas': {
    name: 'Oil & Gas',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_17a45d586-1773792708028.png',
    alt: 'Offshore oil drilling platform surrounded by ocean at dusk',
  },
  utilities: {
    name: 'Utilities',
    image: 'https://images.unsplash.com/photo-1606836287764-838853d78eda',
    alt: 'High voltage electrical power transmission towers and lines at sunset',
  },
  'financial-services': {
    name: 'Financial Services',
    image: 'https://images.unsplash.com/photo-1648587096714-170302c4c922',
    alt: 'Modern financial district with glass skyscrapers reflecting city lights',
  },
  'government-and-defense': {
    name: 'Government and Defense',
    image: 'https://images.unsplash.com/photo-1627738802542-62cbc6998707',
    alt: 'Stately government building with columns and national flag flying',
  },
  maritime: {
    name: 'Maritime',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ca75ea7f-1768420463955.png',
    alt: 'Large cargo container ship sailing through open ocean waters',
  },
  'life-sciences-and-healthcare': {
    name: 'Life Sciences and Healthcare',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_186a3ceaf-1777282013156.png',
    alt: 'Medical researcher in laboratory examining samples under microscope',
  },
  retail: {
    name: 'Retail',
    image: 'https://images.unsplash.com/photo-1612093764919-d6b04df76e0b',
    alt: 'Busy modern retail shopping mall with multiple store fronts and shoppers',
  },
  telecommunications: {
    name: 'Telecommunications',
    image: 'https://images.unsplash.com/photo-1637053596634-66db164b9ea2',
    alt: 'Cell tower and telecommunications antenna against a blue sky',
  },
  transportation: {
    name: 'Transportation',
    image: 'https://images.unsplash.com/photo-1702470193332-8919fa3b4105',
    alt: 'Busy highway interchange with multiple lanes of traffic at night',
  },
  'information-technology-agentic-ai': {
    name: 'Information Technology & Agentic AI',
    image: '/assets/industries/agentic-ai.png',
    alt: 'Abstract network of enterprise IT systems and autonomous AI agents connected by encrypted data pathways',
  },
  iot: {
    name: 'IoT',
    image: '/assets/industries/iot.png',
    alt: 'Industrial IoT sensors, gateways, and connected field devices monitoring a refinery at dusk',
  },
};
