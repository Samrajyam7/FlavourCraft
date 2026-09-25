import { ThreeUIIntro } from './neuform-isolated/NeuformIsolatedEffects';
import { CharacterCarousel, CharacterFilmstrip, CharacterWave } from './character-carousel/CharacterCarousel';
import { LiquidMetalButton } from './liquid-metal-button/LiquidMetalButton';

export { CharacterCarousel, CharacterFilmstrip, CharacterWave, LiquidMetalButton, ThreeUIIntro };

export function TextAnimationCollection({ variant = 'threeui-intro', ...props }: any) {
  if (variant === 'threeui-intro') {
    return <ThreeUIIntro {...props} />;
  }
  return <ThreeUIIntro {...props} />;
}

export * from './character-carousel/CharacterCarousel';
export * from './liquid-metal-button/LiquidMetalButton';
