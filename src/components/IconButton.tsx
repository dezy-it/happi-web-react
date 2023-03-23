import React from "react";
import { colors } from "../constants/color";
import { motion } from "framer-motion";

export type IconButtonProps = {
    size?: number;
    iconSize?: number;
    icon?: any;
    backgroundColor?: string;
    onPress?: () => void;
    color?: string;
    iconStyle?: React.CSSProperties;
    animate?: boolean;
};

function IconButton({
    backgroundColor = colors.red,
    onPress = () => {},
    size = 48,
    iconSize = 24,
    color = "white",
    icon: Icon,
    iconStyle,
    animate = false,
}: IconButtonProps) {
    return (
        <div>
            <button onClick={onPress} style={{ ...buttonStyles, backgroundColor, height: size }}>
                <Icon
                    style={{ height: iconSize, aspectRatio: 1, zIndex: 1, ...iconStyle }}
                    strokeWidth={2}
                    color={color}
                />
                {animate
                    ? new Array(3).fill("animator").map((item, index) => {
                          return (
                              <motion.div
                                  key={item + index}
                                  animate={{ scale: [1, 1.5], opacity: [0.75, 0] }}
                                  transition={{
                                      type: "tween",
                                      repeat: Infinity,
                                      repeatType: "loop",
                                      duration: 2,
                                      repeatDelay: (index + 1) * 0.4,
                                  }}
                                  style={{ ...animator, backgroundColor }}
                              />
                          );
                      })
                    : null}
            </button>
        </div>
    );
}

const buttonStyles: React.CSSProperties = {
    borderRadius: 9999,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    position: "relative",
    outline: "none",
};

const animator: React.CSSProperties = {
    position: "absolute",
    height: "100%",
    width: "100%",
    borderRadius: 999,
};

export default React.memo(IconButton);
