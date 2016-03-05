import { default as cairn } from './lib/factory';
import { compose, variables } from './lib/transformers';
import style from './lib/style';
import pile from './lib/pile';

cairn.style = style;
cairn.pile = pile;
cairn.compose = compose;
cairn.variables = variables;

export default cairn;