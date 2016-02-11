import { default as cairn } from './lib/factory';
import { combineTransformers } from './lib/transformers';
import style from './lib/style';
import pile from './lib/pile';

cairn.style = style;
cairn.pile = pile;
cairn.combineTransformers = combineTransformers;

export default cairn;