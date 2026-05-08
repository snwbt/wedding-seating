import { motion } from "framer-motion";
import { welcomeTitle, welcomeSubtitle, welcomeButton } from "../lib/animations";
import {
  COUPLE_NAMES,
  WEDDING_DATE,
  WEDDING_DATE_2,
  VENUE_NAME,
  HERO_IMAGE,
} from "../lib/constants";
import { useTranslation } from "../lib/i18n";

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-dvh text-center overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero background image with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt=""
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(35,25,15,0.15) 0%, rgba(35,25,15,0.08) 30%, rgba(35,25,15,0.25) 60%, rgba(35,25,15,0.65) 100%)",
          }}
        />
      </div>

      {/* Fallback gradient when no hero image */}
      <div
        className="absolute inset-0 z-[-1]"
        style={{
          background:
            "linear-gradient(170deg, #8ba5b8 0%, #dbb07a 35%, #d4a088 55%, #c4883a 80%, #5c4f3e 100%)",
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 px-6 py-16 flex flex-col items-center">
        <motion.p
          variants={welcomeSubtitle}
          className="font-script text-white/90 text-3xl sm:text-4xl mb-2 drop-shadow-lg"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
        >
          {t("welcomeTagline")}
        </motion.p>

        <motion.h1
          variants={welcomeTitle}
          className="font-display text-white text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight drop-shadow-lg"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
        >
          {COUPLE_NAMES}
        </motion.h1>

        <motion.div
          variants={welcomeSubtitle}
          className="w-16 h-px bg-white/40 my-6"
        />

        <motion.p
          variants={welcomeSubtitle}
          className="font-accent text-white/85 text-lg sm:text-xl italic mb-1 drop-shadow"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.25)" }}
        >
          {WEDDING_DATE}
        </motion.p>

        <motion.p
          variants={welcomeSubtitle}
          className="font-accent text-white/70 text-base italic mb-1 drop-shadow"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.25)" }}
        >
          {t("solemnisation")} — {WEDDING_DATE_2}
        </motion.p>

        <motion.p
          variants={welcomeSubtitle}
          className="font-body text-white/60 text-xs tracking-[0.2em] uppercase mt-2 mb-10 drop-shadow"
        >
          {VENUE_NAME}
        </motion.p>

        <motion.button
          variants={welcomeButton}
          whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(196,136,58,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="bg-white/20 backdrop-blur-sm text-white border border-white/30 font-body font-medium text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-button shadow-soft hover:bg-white/30 transition-all cursor-pointer"
        >
          {t("welcomeButton")}
        </motion.button>
      </div>
    </motion.div>
  );
}
