import Image from 'next/image';
import React from 'react';

/**
 * Dual logo (AIAA + Zewail City) used in the navbar and footer.
 *
 * AIAA mark stays at the host-org wordmark dimensions (wide horizontal
 * lockup, height-constrained so width auto-fills). The Zewail City mark
 * is a 256x256 square monogram, so it's scaled substantially larger
 * than its height alone would suggest — otherwise a small h-N reads
 * as just another tiny icon instead of a brand mark.
 */
export default function Logo({ scrolled }: { scrolled?: boolean }) {
  // Default (un-scrolled): AIAA 48px / ZC 112px — the monogram is the
  //                       visual anchor and reads clearly from across the room.
  // Scrolled:             AIAA 36px / ZC  80px — still legible when compacts.
  const aiaaSize = scrolled ? 'h-7 md:h-9 w-auto'    : 'h-8 md:h-12 w-auto';
  const zcSize   = scrolled ? 'h-14 md:h-20 w-auto'  : 'h-20 md:h-28 w-auto';

  return (
    <div className="flex items-center gap-3 md:gap-4 select-none">
      <Image
        src="/aiaa-logo.png"
        alt="AIAA"
        width={4815}
        height={1339}
        className={`${aiaaSize} logo-white transition-[height] duration-base ease-human`}
      />
      <div
        className={`${scrolled ? 'h-7 md:h-9' : 'h-14 md:h-20'} w-px bg-white/40`}
        aria-hidden="true"
      />
      <Image
        src="/zc-logo.png"
        alt="Zewail City of Science and Technology"
        width={256}
        height={256}
        className={`${zcSize} logo-white transition-[height] duration-base ease-human`}
      />
    </div>
  );
}
