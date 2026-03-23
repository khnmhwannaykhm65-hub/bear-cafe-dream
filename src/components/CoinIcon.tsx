import coinIconSrc from '@/assets/coin-icon.png';

interface CoinIconProps {
  size?: number;
  className?: string;
}

export default function CoinIcon({ size = 16, className = '' }: CoinIconProps) {
  return (
    <img
      src={coinIconSrc}
      alt="coin"
      width={size}
      height={size}
      className={`inline-block align-middle ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Inline coin icon for use inside text strings */
export function coinImg(size = 14) {
  return `<img src="${coinIconSrc}" alt="coin" width="${size}" height="${size}" style="display:inline;vertical-align:middle;width:${size}px;height:${size}px" />`;
}

export { coinIconSrc };
