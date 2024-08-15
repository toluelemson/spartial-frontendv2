import React from "react";
import "./AboutUs.css";
import "bootstrap/dist/css/bootstrap.min.css";

interface Employee {
  id: string;
  image: string;
  name: string;
  designation: string;
  twitter?: string;
  linkedin?: string;
  email?: string;
}

interface Partner {
  name: string;
  logo: string;
  employees: Employee[];
}

const partners: Partner[] = [
  {
    name: "University of Tartu, Estonia",
    // logo: "https://spatial-h2020.eu/wp-content/uploads/2021/11/Tartu_Logo_Def.png",
    logo: "./Tartu_Logo.png",
    employees: [
      {
        id: "1",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2022/07/Abdul-Rasheed-Ottun-1754x2500-e1680266621574-uai-516x516.jpg",
        name: "Abdul-Rasheed Ottun",
        designation: "Junior Research Assistance",
        linkedin: "https://www.linkedin.com/in/abdul-rasheed-ottun-68a136175/",
        email: "rasheed.ottun@ut.ee",
      },
      {
        id: "2",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2024/02/Rashinthe-2038x2038-uai-516x516.jpg",
        name: "Rasinthe Marasinghe",
        designation: "Scientific programmer",
        linkedin: "https://www.linkedin.com/in/rmarasinghe/",
        email: "rasinthe.marasinghe@ut.ee",
      },
      {
        id: "3",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2024/02/Mathew-2299x2299-uai-516x516.jpg",
        name: "Toluwani Mathew Elemosho",
        designation: "Scientific programmer",
        email: "toluwani.mathew.elemosho@ut.ee",
      },
      {
        id: "4",
        image: "./mohanl.jpg",
        name: "Mohan Liyanage",
        designation: "Lecturer",
        email: "mohan.liyanage@ut.ee",
      },
      {
        id: "5",
        image: "./ash.jpg",
        name: "Ashfaq Hussain Ahmed",
        designation: "Scientific programmer",
        email: "ashfaq.hussain.ahmed@ut.ee",
      },
      {
        id: "6",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2022/07/Huber-Flores-1780x2500-e1680266575471-uai-516x516.jpg",
        name: "Huber Flores",
        designation: "Associate Professor",
        twitter: "https://twitter.com/HuberFlores",
        linkedin: "https://linkedin.com/in/huber-flores-a144a73b",
        email: "huber.flores@ut.ee",
      },
    ],
  },

  {
    name: "Fraunhofer Institute for Open Communiction Systems, Germany",
    logo: "https://spatial-h2020.eu/wp-content/uploads/2021/10/Fraunhofer_FOKUS_transparent-uai-516x138.png",
    employees: [
      {
        id: "8",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/Michell_Boerger-500x500.jpg",
        name: "Michell Boerger",
        designation: "Research Scientist",
        linkedin: "https://www.linkedin.com/in/michell-boerger-a6b07b118",
        email: "michell.boerger@fokus.fraunhofer.de",
      },
      {
        id: "9",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/Nikolay_Tcholtchev-500x500.jpg",
        name: "Nikolay Tcholtchev",
        designation: "Senior Researcher and Project manager",
        linkedin: "https://www.linkedin.com/in/nikolay-tcholtchev-phd-b995403b",
        email: "nikolay.tcholtchev@fokus.fraunhofer.de",
      },

      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/Philipp_Lammel-500x500.jpg",
      //   name: "Philipp Lämmel",
      //   designation: "Senior researcher",
      //   linkedin: "https://www.linkedin.com/in/philipp-laemmel",
      //   email: "",
      // },
    ],
  },
  {
    name: "University College Dublin, Irelend",
    logo: "https://spatial-h2020.eu/wp-content/uploads/2021/11/UDC_Logo_Def.png",
    employees: [
      {
        id: "10",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/Chamara-UCD-715x951-uai-516x516.jpg",
        name: "Chamara Sandeepa",
        designation: "Doctoral Student/Research Engineer",
        twitter: "https://twitter.com/cpsandeepaabeys",
        linkedin: "https://www.linkedin.com/in/chamara-prabhash-923254124/",
        email: "abeysinghe.sandeepa@ucdconnect.ie",
      },
      {
        id: "11",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/Thulitha-UCD-689x885-uai-516x516.jpg",
        name: "Thulitha Senevirathna",
        designation: "Doctoral Student/Research Engineer",
        twitter: "https://twitter.com/101Tts",
        linkedin: "https://www.linkedin.com/in/thulitha-ts/",
        email: "thulitha.senevirathna@ucdconnect.ie",
      },
      {
        id: "12",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/shen-UCD.png",
        name: "Shen Wang",
        designation: "Assistant Professor",
        linkedin: "https://www.linkedin.com/in/shen-wang-ucd",
        email: "shen.wang@ucd.ie",
      },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/Madhusanka_LIyanage1-UCD-uai-513x513.png",
      //   name: "Madhusanka Liyanage",
      //   designation: "Assistant Professor / Ad Astra Fellow",
      //   twitter: "https://twitter.com/mliyanagep",
      //   linkedin: "https://www.linkedin.com/in/madhusanka-liyanage-067236b9/",
      //   email: "madhusanka@ucd.ie",
      // },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/12/Bart-UCD-1000x1105-uai-516x516.jpg",
      //   name: "Bartlomiej Siniarski",
      //   designation: "PostDoctoral Researcher / Project Manager",
      //   linkedin: "https://www.linkedin.com/in/bartsiniarski/",
      //   email: "bartlomiej.siniarski@ucd.ie",
      // },
    ],
  },
  {
    name: "Montimage, France",
    logo: "https://spatial-h2020.eu/wp-content/uploads/2021/10/logo_montimage_vertical-uai-516x225.png",
    employees: [
      {
        id: "13",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/vinh_hoa-2365x2249-uai-516x516.jpg",
        name: "Vinh Hoa La",
        designation: "Research and Development Engineer",
        linkedin: "https://www.linkedin.com/in/hoalavinh/",
        email: "vinh_hoa.la@montimage.com",
      },
      {
        id: "14",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/manh_dung-649x687-uai-516x516.jpg",
        name: "Manh Dung Nguyen",
        designation: "Research Engineer",
        linkedin: "https://www.linkedin.com/in/strongcourage/",
        email: "manhdung.nguyen@montimage.com",
      },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/ana-1784x1660-uai-516x516.jpg",
      //   name: "Ana Cavalli",
      //   designation: "Research director",
      //   email: "",
      // },

      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/edgardo-2178x2239-uai-516x516.jpg",
      //   name: "Edgardo Montes de Oca",
      //   designation: "",
      //   linkedin: "https://www.linkedin.com/in/edgardo-montes-de-oca/",
      //   email: "",
      // },
    ],
  },
  {
    name: "NEC Labs, Germany",
    logo: "https://spatial-h2020.eu/wp-content/uploads/2021/10/NEC_logo_1-uai-516x214.png",
    employees: [
      {
        id: "15",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/csoriente-283x336-uai-283x283.jpg",
        name: "Claudio Soriente",
        designation: "Principal Research Scientist",
        linkedin: "https://linkedin.com/in/claudiosoriente",
        email: "claudio.soriente@neclab.eu",
      },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/sbriongos-336x414-uai-336x336.jpg",
      //   name: "Samira Briongos Herrero",
      //   designation: "Cyber Security Research Scientist",
      //   linkedin: "https://linkedin.com/in/samira-briongos-herrero-01bb1b36",
      // },
    ],
  },
  {
    name: "VTT Technical Research Center of Finland Ltd., Finland",
    logo: "https://spatial-h2020.eu/wp-content/uploads/2022/04/WithSecure_logo_charcoal_black-uai-516x117.png",
    employees: [
      {
        id: "16",
        image: "",
        name: "Samuel Marchal",
        designation: "",
        twitter: "",
        linkedin: "",
        email: "samuel.marchal@withsecure.com",
      },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/mark-512x512.jpg",
      //   name: "Mark Van Heeswijk",
      //   designation: "Senior Data Scientist",
      //   twitter: "https://twitter.com/mark_vh",
      //   linkedin: "https://www.linkedin.com/in/markvanheeswijk/",
      //   email: "",
      // },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/alexey-600x514-uai-514x514.jpg",
      //   name: "Alexey Kirichenko",
      //   designation: "Research Collaboration Manager",
      //   email: "",
      // },
    ],
  },

  {
    name: "Telefonica Research, Spain",
    logo: "https://spatial-h2020.eu/wp-content/uploads/2021/10/logo-uai-516x172.png",
    employees: [
      {
        id: "17",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2023/10/David_UPF-2160x1440-uai-516x516.jpg",
        name: "David Solans Noguero",
        designation: "Researcher at Telefónica Research",
        linkedin: "https://www.linkedin.com/in/david-solans-noguero-48269b85/",
        email: "david.solansnoguero@telefonica.com",
      },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/nk-600x600-uai-516x516.jpg",
      //   name: "Nicolas Kourtellis",
      //   designation: "Research scientist",
      //   twitter: "https://twitter.com/kourtellis",
      //   linkedin: "https://www.linkedin.com/in/nicolas-kourtellis-3a154511/",
      //   email: "",
      // },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/perino_photo-841x1157-uai-516x516.jpg",
      //   name: "Diego Perino",
      //   designation: "Director of Telefonica Research",
      //   twitter: "https://twitter.com/diego_perino",
      //   linkedin: "https://www.linkedin.com/in/diegoperino/",
      //   email: "",
      // },
      // {
      //   id: "",
      //   image:
      //     "https://spatial-h2020.eu/wp-content/uploads/2021/10/al-640x800-uai-516x516.jpg",
      //   name: "Andra Lutu",
      //   designation: "Associate Researcher",
      //   twitter: "https://twitter.com/dadalusa",
      //   linkedin: "https://www.linkedin.com/in/andra-lutu-a8966637",
      //   email: "",
      // },
    ],
  },
  {
    name: "Delft University of Technology, Netherlands",
    logo: "https://spatial-h2020.eu/wp-content/uploads/2021/10/tudelft-uai-516x201.png",
    employees: [
      {
        id: "18",
        image:
          "https://spatial-h2020.eu/wp-content/uploads/2021/10/aaron-ding-1200x1200-uai-516x516.jpg",
        name: "Aaron Yi Ding",
        designation:
          "Coordinator & Research Director of SPATIAL, Director of CPI Lab",
        twitter: "https://twitter.com/aaronyiding",
        linkedin: "https://www.linkedin.com/in/aaronyiding/",
        email: "aaron.ding@tudelft.nl",
      },
      //     {
      //   id: "",
      //       image:
      //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/Marijn-Janssen-301x301.jpg",
      //       name: "Marijn Janssen",
      //       designation: "Professor of ICT Governance",
      //       twitter: "https://twitter.com/HMarijn",
      //       linkedin: "https://www.linkedin.com/in/janssenmarijn/",
      //       email: "m.f.w.h.a.janssen@tudelft.nl",
      //     },
      //     {
      //   id: "",
      //       image:
      //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/catholijne-jonker-467x467.jpg",
      //       name: "Catholijn Jonker",
      //       designation: "Professor of Interactive Intelligence",
      //       email: "",
      //     },
      //     {
      //   id: "",
      //       image:
      //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/Martijn_Warnier-301x301.jpg",
      //       name: "Martijn Warnier",
      //       designation: "Professor of Complex Systems Design",
      //       email: "",
      //     },
      //     {
      //   id: "",
      //       image:
      //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/Roel-Dobbe-301x301.jpg",
      //       name: "Roel Dobbe",
      //       designation: "Assistant Professor",
      //       email: "",
      //     },
      //     {
      //   id: "",
      //       image:
      //         "https://spatial-h2020.eu/wp-content/uploads/2022/10/Marcus-Westberg-852x977-uai-516x516.jpg",
      //       name: "Marcus Westberg",
      //       designation: "Postdoctoral Researcher / Project Manager",
      //       email: "m.westberg@tudelft.nl",
      //     },
      //     {
      //   id: "",
      //       image:
      //         "https://spatial-h2020.eu/wp-content/uploads/2022/10/Prachi-Bagave-1341x1565-uai-516x516.jpg",
      //       name: "Prachi Bagave",
      //       designation: "PhD Researcher",
      //       linkedin: "https://linkedin.com/in/prachi-bagave",
      //       email: "p.bagave@tudelft.nl",
      //     },
      //     {
      //   id: "",
      //       image:
      //         "https://spatial-h2020.eu/wp-content/uploads/2023/11/Sebastian-Mateiescu-1667x2500-e1699882060215-uai-516x516.jpg",
      //       name: "Sebastian Mateiescu",
      //       designation: "Coordinator EU-projects",
      //       linkedin: "https://www.linkedin.com/in/sebastian-mateiescu-56296a230/",
      //       email: "z.s.mateiescu@tudelft.nl",
      //     },
    ],
  },

  // {
  //   name: "Mainflux Labs",
  //   logo: "https://spatial-h2020.eu/wp-content/uploads/2021/10/Mainflux-Labs-Logo-uai-516x89.png",
  //   employees: [
  //     {
  //       id: "",
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2022/04/Dusan-Mainflux-IoT-Solutions-580x645-uai-516x516.jpg",
  //       name: "Dusan Borovcanin",
  //       designation: "Software Developer",
  //       linkedin:
  //         "https://www.linkedin.com/in/du%C5%A1an-borov%C4%8Danin-82015b165/",
  //     },
  //     {
  //       id: "",
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/Sasa-Mainflux-IoT-Solutions-575x640-uai-516x516.jpg",
  //       name: "Sasa Klopanovic",
  //       designation: "Director",
  //       twitter: "https://twitter.com/Klopanovic",
  //       linkedin: "https://www.linkedin.com/in/sasa-klopanovic-2559964/",
  //     },
  //   ],
  // },
  // {
  //   name: "Erasmus University Rotterdam",
  //   logo: "https://spatial-h2020.eu/wp-content/uploads/2021/10/EUR-logo-1-uai-516x387.png",
  //   employees: [
  //     {
  //       id: "",
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/Jason_Pridmore-500x500.jpg",
  //       name: "Jason Pridmore",
  //       designation:
  //         "Director of Education, Erasmus School of History, Culture and Communication",
  //       twitter: "https://twitter.com/ConsumerSurv",
  //       linkedin: "https://www.linkedin.com/in/jason-pridmore-31016246/",
  //     },
  //     {
  //       id: "",
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/joao_goncalves1-800x800-uai-516x516.jpg",
  //       name: "João Gonçalves",
  //       designation: "Assistant professor",
  //       twitter: "https://twitter.com/JFFGoncalves",
  //       linkedin:
  //         "https://www.linkedin.com/in/jo%C3%A3o-gon%C3%A7alves-363677204/",
  //     },
  //     {
  //       id: "",
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/tessa_oomen-682x682-uai-516x516.jpg",
  //       name: "Tessa Oomen",
  //       designation: "PhD Candidate",
  //       twitter: "https://twitter.com/Tapoomen",
  //       linkedin: "https://www.linkedin.com/in/tapoomen/",
  //     },
  //     {
  //       id: "",
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2024/01/Selma-Toktas_photo-631x602-uai-516x516.jpg",
  //       name: "Selma Toktas",
  //       designation: "Postdoctoral researcher",
  //       linkedin: "http://www.linkedin.com/in/selma-toktas-phd-b61b6b32",
  //     },
  //   ],
  // },
  // {
  //   name: "Australo",
  //   logo: "https://spatial-h2020.eu/wp-content/uploads/2022/09/AustraloNewLogo-500x500-1.png",
  //   employees: [
  //     {
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/jose_profile-2372x2373-uai-516x516.jpg",
  //       name: "José González",
  //       designation: "",
  //       linkedin: "https://www.linkedin.com/in/joseglezes",
  //     },
  //     {
  //       image: "https://spatial-h2020.eu/wp-content/uploads/2023/01/Giulia.png",
  //       name: "Giulia Pastor",
  //       designation: "Project Manager",
  //       linkedin: "https://www.linkedin.com/in/giulia-pastor-49641121/",
  //     },
  //     {
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2021/10/Blanca_Arregui-1348x1347-uai-516x516.jpg",
  //       name: "Blanca Arregui",
  //       designation: "Communication Manager",
  //       twitter: "https://twitter.com/blarregui",
  //       linkedin: "https://www.linkedin.com/in/blancaarregui",
  //     },
  //   ],
  // },
  // {
  //   name: "MinnaLearn",
  //   logo: "https://spatial-h2020.eu/wp-content/uploads/2022/09/MinnaLearn-Logo-601x83-uai-516x71.jpg",
  //   employees: [
  //     {
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2023/03/Laura-800x800-uai-516x516.jpg",
  //       name: "Laura Bruun",
  //       designation: "Project Manager",
  //       twitter: "https://twitter.com/laurajbruun",
  //       linkedin: "https://www.linkedin.com/in/laura-bruun",
  //     },
  //     {
  //       image:
  //         "https://spatial-h2020.eu/wp-content/uploads/2023/11/VilleV-480x480.jpeg",
  //       name: "Ville Valtonen",
  //       designation: "CEO",
  //       linkedin: "https://www.linkedin.com/in/valtonenville/",
  //     },
  //   ],
  // },
];

const employeeOrder = [
  "1", // Replace with actual employee IDs
  "2",
  "3",
  "4",
  "5",
  "8",
  "10",
  "11",
  "13",
  "14",
  "15",
  "16",
  "12",
  "17",
  "9",
  "18",
  "6",
  // Add more employee IDs as needed
];

const services = [
  {
    name: "Network Traffic Service",
    apiSpecLink: "http://acas.montimage.com:31057/",
  },
  {
    name: "Medical Analysis Service",
    apiSpecLink:
      "https://medical-analysis-service.apps.osc.fokus.fraunhofer.de/docs#/",
  },
  {
    name: "Differential Privacy Service",
    apiSpecLink:
      "https://app.swaggerhub.com/apis/DAVIDSOLANSNOGUERO/Differential_Privacy_Module/1.0.0",
  },
  { name: "Metrics Service", apiSpecLink: "http://netslabsv1.ucd.ie/docs" },
  {
    name: "Fairness Service",
    apiSpecLink: "http://193.40.154.161:8083/docs",
  },
  {
    name: "LLM Service",
    apiSpecLink: "http://193.40.155.160:5003/docs/",
  },
];

const AboutUs: React.FC = () => {
  const employeeMap = new Map<
    string,
    { employee: Employee; partnerName: string; partnerLogo: string }
  >();
  partners.forEach((partner) =>
    partner.employees.forEach((employee) =>
      employeeMap.set(employee.id, {
        employee,
        partnerName: partner.name,
        partnerLogo: partner.logo,
      })
    )
  );
  return (
    <>
      <div className="about-us container">
        <div className="text-center mb-5">
          <h1 className="display-4">Team</h1>
          <h2 className="h4">
            Introducing Our International Development Team: A Collaboration
            Across 8 EU Member States and 8 Leading Companies
          </h2>
        </div>

        <div className="employee-partner-table">
          {/* <h2>Employee & Partner Information</h2> */}
          <table>
            <thead>
              <tr>
                {/* <th>#</th> */}
                <th>
                  <b>Name</b>
                </th>
                {/* <th>Designation</th> */}
                <th>
                  <b>Partner</b>
                </th>
                <th>
                  <b>Email</b>
                </th>
                <th>
                  <b>Logo</b>
                </th>
              </tr>
            </thead>
            <tbody>
              {employeeOrder.map((employeeId, index) => {
                const data = employeeMap.get(employeeId);
                if (!data) return null;
                const { employee, partnerName, partnerLogo } = data;
                return (
                  <tr key={employeeId}>
                    {/* <td>{index + 1}</td> */}
                    <td>{employee.name}</td>
                    {/* <td>{employee.designation}</td> */}
                    <td>{partnerName}</td>
                    <td>{employee.email}</td>
                    <td>
                      <img
                        src={partnerLogo}
                        alt={`${partnerName} logo`}
                        className="partner-logo-small"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="api-specifications">
          <h1 className="display-5 text-center">
            API Specification for each Service
          </h1>
          <table>
            <thead>
              <tr>
                <th>
                  <b>Service Name</b>
                </th>
                <th>
                  <b>API Documentation</b>
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={index}>
                  <td>{service.name}</td>
                  <td>
                    <a
                      href={service.apiSpecLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {service.apiSpecLink}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="publications">
          <h1 className="display-4">Publications</h1>
          <div className="bibtex-entry">
            {/* <p className="display-6"> */}
            <h2 className="h4">
              The SPATIAL Architecture: Design and Development Experiences from
              Gauging and Monitoring the AI Inference Capabilities of Modern
              Applications
            </h2>

            {/* </p> */}
            <pre>
              {`@inproceedings{ottunspatial,
  title={The SPATIAL Architecture: Design and Development Experiences from Gauging and Monitoring the AI Inference Capabilities of Modern Applications},
  author={Ottun, Abdul-Rasheed and Marasinghe, Rasinthe and Elemosho, Toluwani and Liyanage, Mohan and Ragab, Mohamad and Bagave, Prachi and Westberg, Marcus and Asadi, Mehrdad and Boerger, Michell and Sandeepa, Chamara and others},
  booktitle={2024 IEEE 44th International Conference on Distributed Computing Systems (ICDCS)},
  year={2024},
  organization={IEEE}
}`}
            </pre>
          </div>
          <div className="bibtex-entry">
            {/* <h5 className="display-6">
              SPATIAL: Practical Trustworthiness with Human Oversight
            </h5> */}
            <h2 className="h4">
              SPATIAL: Practical Trustworthiness with Human Oversight
            </h2>
            <pre>
              {`@article{ottunspatialdemo,
  title={SPATIAL Architecture: Practical AI Trustworthiness with Human Oversight},
  author={Ottun, Abdul-Rasheed and Marasinghe, Rasinthe and Elemosho, Toluwani and Ahmed, Hussein Ashfaq and others},
  booktitle={2024 IEEE 44th International Conference on Distributed Computing Systems (ICDCS)},
  year={2024},
  organization={IEEE}
}`}
            </pre>
          </div>
        </div>
      </div>
      <br /> <br />
    </>
  );
};

export default AboutUs;
