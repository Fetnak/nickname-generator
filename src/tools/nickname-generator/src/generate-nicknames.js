import { log } from "../../../functions/log.js";
import Nicknames from "./classes/nicknames.js";

export const generateNicknames = (args, modelInfo) => {
	return new Nicknames(args, modelInfo).generateNicknames();	
};
