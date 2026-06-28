import { FoodCategory } from '../types';

const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  'Proteína': '🍗',
  'Carboidrato': '🍚',
  'Gordura': '🥑',
  'Vegetal': '🥦',
  'Fruta': '🍓',
  'Laticínio': '🥛',
  'Bebida': '🥤',
  'Outro': '🍽️',
};

// Correspondências por palavra-chave no nome (têm prioridade sobre a categoria).
const NAME_HINTS: [RegExp, string][] = [
  [/frango|peito|coxa/i, '🍗'],
  [/ovo|clara/i, '🥚'],
  [/peixe|tilápia|salmão|atum|sardinha/i, '🐟'],
  [/camarão|frutos do mar/i, '🦐'],
  [/carne|patinho|acém|mignon|lombo|fígado|seca/i, '🥩'],
  [/whey|suplemento/i, '🥤'],
  [/arroz/i, '🍚'],
  [/feijão|lentilha|grão/i, '🫘'],
  [/batata/i, '🥔'],
  [/mandioca|inhame/i, '🍠'],
  [/pão/i, '🍞'],
  [/macarrão|massa/i, '🍝'],
  [/aveia|granola|cereal|quinoa|cuscuz/i, '🌾'],
  [/milho|polenta/i, '🌽'],
  [/tapioca|pão de queijo|farofa/i, '🫓'],
  [/azeite|óleo/i, '🫒'],
  [/abacate/i, '🥑'],
  [/castanha|amêndoa|noz|amendoim|oleaginosa/i, '🥜'],
  [/coco/i, '🥥'],
  [/chia|linhaça|semente/i, '🌱'],
  [/leite/i, '🥛'],
  [/iogurte/i, '🍶'],
  [/queijo|ricota|requeijão|cottage|mussarela/i, '🧀'],
  [/banana/i, '🍌'],
  [/maçã/i, '🍎'],
  [/mamão|manga/i, '🥭'],
  [/laranja/i, '🍊'],
  [/morango/i, '🍓'],
  [/abacaxi/i, '🍍'],
  [/uva/i, '🍇'],
  [/melancia/i, '🍉'],
  [/pera/i, '🍐'],
  [/kiwi/i, '🥝'],
  [/açaí|maracujá|goiaba/i, '🫐'],
  [/brócolis|couve|espinafre|vagem|quiabo/i, '🥦'],
  [/alface|pepino/i, '🥬'],
  [/tomate/i, '🍅'],
  [/cenoura/i, '🥕'],
  [/abobrinha|abóbora|berinjela/i, '🍆'],
  [/beterraba|pimentão/i, '🫑'],
  [/couve-flor/i, '🥦'],
  [/água/i, '💧'],
  [/suco/i, '🧃'],
  [/café/i, '☕'],
  [/mel/i, '🍯'],
  [/chocolate|cacau|doce/i, '🍫'],
];

export const foodEmoji = (name: string, category?: FoodCategory): string => {
  for (const [re, emoji] of NAME_HINTS) {
    if (re.test(name)) return emoji;
  }
  return category ? CATEGORY_EMOJI[category] : '🍽️';
};
