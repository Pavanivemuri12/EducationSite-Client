import { motion } from "framer-motion";
import { ContactRound, NotebookTabsIcon, UserCheck, VideoIcon } from "lucide-react";
import { TbMessageChatbot } from "react-icons/tb";

const ServicesData = [
 {
    id: 1,
    title: "Semester-wise Notes",
    link: "/notes", // ✅ Navigate to Notes
    icon: <NotebookTabsIcon size={32} />,
    delay: 0.2,
  },
  {
    id: 2,
    title: "Semester-wise Learning Videos",
    link: "/courses", // ✅ Navigate to Courses
    icon: <VideoIcon size={32} />,
    delay: 0.3,
  },
  {
    id: 3,
    title: "Lab Learning Videos",
    link: "/courses", // ✅ Navigate to Courses
    icon: <VideoIcon size={32} />,
    delay: 0.4,
  },
  {
    id: 4,
    title: "24/7 AI Chatbot",
    link: "/chatbot", // ✅ Navigate to Chatbot
    icon: <TbMessageChatbot size={32} />,
    delay: 0.5,
  },
  {
    id: 5,
    title: "Contact Us",
    link: "/contact", // ✅ Navigate to Contact
    icon: <ContactRound size={32} />,
    delay: 0.6,
  },
  {
    id: 6,
    title: "User-Friendly Interface",
    link: "/", // ✅ Navigate to Home/Hero
    icon: <UserCheck size={32} />,
    delay: 0.7,
  },
];


const SlideLeft = (delay) => {
  return {
    initial: { opacity: 0, x: 50 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay,
        ease: "easeInOut",
      },
    },
  };
};

const Services = () => {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-left pb-10">
          Services we provide
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ServicesData.map((service) => (
            <motion.div
              key={service.id}
              variants={SlideLeft(service.delay)}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-[#f4f4f4] rounded-xl flex flex-col gap-3 items-center justify-center text-center p-6 py-8 transition-transform duration-300 hover:bg-white hover:scale-105 hover:shadow-lg"
            >
              <div className="text-primary mb-3">{service.icon}</div>
              <h2 className="text-base sm:text-lg font-medium">{service.title}</h2>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
