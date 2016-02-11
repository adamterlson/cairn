import { default as cairn } from './lib/factory';
import { combineTransformers } from './lib/transformers';
import style from './lib/style';
import pile from './lib/pile';

cairn.combineTransformers = combineTransformers;
cairn.style = style;
cairn.pile = pile;

export default cairn;