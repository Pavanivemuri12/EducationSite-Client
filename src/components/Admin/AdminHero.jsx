import { IoIosArrowRoundForward } from "react-icons/io";
//import Navbar from "../Navbar/Navbar";
import blob from "../../assets/blob.svg";
import hero from "../../assets/hero.png";
import { motion } from "framer-motion";
import Services from "../Services/Services";
import Subscribe from "../Subscribe/Subscribe"
import Footer from "../Footer/Footer";
import Banner from "../Banner/Banner"
import Banner2 from "../Banner/Banner2"

export const FadeUp = (delay) => {
  return {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5,
        delay: delay,
        ease: "easeInOut",
      },
    },
  };
};

const Hero = () => {
  return (
    <>
    <section className="bg-light overflow-hidden relative">
      {/* <Navbar /> */}
      <div className="container grid grid-cols-1 md:grid-cols-2 min-h-[650px]">
        {/* Brand Info */}
        <div className="flex flex-col justify-center py-14 md:py-0 relative z-20">
          <div className="text-center md:text-left space-y-10 lg:max-w-[400px]">
            <motion.h1
              variants={FadeUp(0.6)}
              initial="initial"
              animate="animate"
              className="text-3xl lg:text-5xl font-bold !leading-snug"
            >
              Let&apos;s Learn and get the{" "}
              <span className="text-secondary">best results </span>through smart
              work
            </motion.h1>
            <motion.div
              variants={FadeUp(0.8)}
              initial="initial"
              animate="animate"
              className="flex justify-center md:justify-start"
            >
              <button className="primary-btn flex items-center gap-2 group text-2xl">
                Get Started
                <IoIosArrowRoundForward
                  className="text-2xl group-hover:translate-x-4 
                group-hover:rotate-90 duration-300"
                />
              </button>
            </motion.div>
          </div>
        </div>
        {/* Hero image */}
        <div className="flex justify-center items-center">
          <motion.img
            initial={{x:50, opacity: 0}}
            animate={{x:0, opacity: 1}}
            transition={{duration: 0.6, delay:0.4, ease: "easeInOut"}}
            src={hero}
            alt=""
            className="w-[400px] xl:w-[600px] relative z-10 drop-shadow"
          />
          <motion.img
          initial={{x: -50, opacity: 0}}
          animate={{x: 0, opacity:1}}
          transition={{ duration: 0.6, delay:0.2, ease:"easeInOut"}}
            src={blob}
            alt=""
            className="absolute -bottom-32 w-[800px] md:w-[1500px] z-[1] hidden md:block "
          />
        </div>
      </div>
    </section>
    
 <Services/>
 <Banner/>
 <Subscribe/>
 <Banner2/>
 <Footer/>
 </>
  );
 
};

export default Hero;
