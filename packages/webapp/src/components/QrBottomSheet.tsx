import { motion, AnimatePresence } from "framer-motion";
import { QrCodeCard } from "./QrCodeCard.js";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function QrBottomSheet({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 900,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            style={{
              position: "fixed",
              bottom: 0, left: 0, right: 0,
              zIndex: 901,
              background: "var(--color-bg, #faf6f1)",
              borderRadius: "24px 24px 0 0",
              padding: "12px 20px calc(var(--safe-bottom, 20px) + 20px)",
              maxHeight: "85vh",
              overflow: "auto",
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 4,
              background: "rgba(0,0,0,0.12)",
              margin: "0 auto 16px",
            }} />

            {/* Title */}
            <h3 style={{
              fontFamily: "var(--font-display, 'Nunito', sans-serif)",
              fontSize: 20, fontWeight: 800,
              color: "var(--color-text, #1a1a1a)",
              textAlign: "center",
              margin: "0 0 16px",
            }}>
              Ваш QR-код
            </h3>

            <QrCodeCard />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
