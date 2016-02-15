import { default as cairn } from './lib/factory';
import { compose } from './lib/transformers';
import style from './lib/style';
import pile from './lib/pile';

cairn.style = style;
cairn.pile = pile;
cairn.compose = compose;

export default cairn;