import React, { useEffect, useRef } from 'react'
import { useCall } from "../../context/CallProvider";
import { motion } from "framer-motion";


export default function ChatMode() {
     const { isVideoMode, socket } = useCall();

     return (
          <motion.div>
               {isVideoMode ? null : (
                    <motion.div>
                         chat
                    </motion.div>)}
          </motion.div>
     )
}