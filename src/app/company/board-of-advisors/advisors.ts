export interface Advisor {
  name: string;
  title: string;
  image?: string;
  bio: string[];
}

export const advisors: Advisor[] = [
  {
    name: 'Jack Balletto',
    title: 'Advisor',
    image: '/assets/advisor-glenn-kesselman.png',
    bio: [
      'Jack Balletto received a Master\u2019s degree in electrical engineering from the University of Santa Clara in 1967. He worked at Lockheed in electronic countermeasures, and then joined Fairchild Semiconductor in a MOS marketing role in 1969. With two associates from Fairchild, Balletto co-founded Synertek, a MOS supplier to video game and PC vendors that was acquired by Honeywell in 1978. Mr. Balletto was a founder and the first CEO of VLSI Technology, Inc. He later worked in Hambrecht & Quist\u2019s venture practice, where he backed and built numerous semiconductor and systems companies.',
    ],
  },
  {
    name: 'Jack Russo',
    title: 'General Counsel',
    image: '/assets/advisor-jack-russo.png',
    bio: [
      'Jack Russo obtained his undergraduate degree in business from CUNY in 1977 and his MBA and JD from U.C. Berkeley and UCLA in 1980. He specializes in Internet, computer law, and intellectual property litigation.',
      'He is a frequent speaker on computer law issues and has given presentations to the American Bar Association, the Practicing Law Institute, the Computer Law Association, and the San Francisco Bay Area Intellectual Property American Inn of Court. Jack serves as an arbitrator, mediator, and trusted counsel to technology companies and entrepreneurs.',
    ],
  },
  {
    name: 'Denny Kelleher',
    title: 'Advisor',
    image: '/assets/advisor-denny-kelleher.png',
    bio: [
      'Denny Kelleher received an undergraduate degree in Electronics from Cork Institute of Technology in 1994. Most recently, Denny held the position of Director of Localization and Internationalization at Netflix. He successfully led the international expansion of Netflix, bringing the platform into more than 50 countries.',
      'Before Netflix, Denny held senior leadership positions at Apple, starting with their first localization team in Europe. Due to his initial achievements, he was sent to the US-Apple HQ and continued to work in senior leadership roles for more than 22 years.',
    ],
  },
];
