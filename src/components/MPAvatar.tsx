import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { imageResolver, ImageResolutionResult } from '../services/imageResolverService';
import { MPRecord } from '../types';

interface MPAvatarProps {
  mp: Partial<MPRecord> & { name: string };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export const MPAvatar: React.FC<MPAvatarProps> = ({
  mp,
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const [resolution, setResolution] = useState<ImageResolutionResult>(() =>
    imageResolver.resolveMpImageSync(mp as any)
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Initial sync check
    const syncRes = imageResolver.resolveMpImageSync(mp as any);
    setResolution(syncRes);
    setImgError(false);

    // If fallback and no photo, attempt verified entity resolution
    if (syncRes.isAvatarFallback && mp.name) {
      imageResolver
        .resolveWikipediaEntityAsync({
          name: mp.name,
          constituency: mp.constituency,
          state: mp.state,
          house: mp.house,
          party: mp.party,
        })
        .then(asyncRes => {
          if (isMounted && asyncRes.imageUrl) {
            setResolution(asyncRes);
            setImgError(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [mp.name, mp.constituency, mp.state, mp.photo, (mp as any).photoUrl, (mp as any).officialPhotoUrl]);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs rounded-xl',
    md: 'w-14 h-14 text-sm rounded-2xl',
    lg: 'w-20 h-20 text-lg rounded-2xl',
    xl: 'w-28 h-28 text-2xl rounded-3xl',
  };

  const badgeSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  const initials = resolution.initials || imageResolver.getInitials(mp.name);
  const bgColors = imageResolver.getAvatarBgColor(mp.party, mp.name);
  const hasValidImage = resolution.imageUrl && !imgError && !resolution.isAvatarFallback;

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {hasValidImage ? (
        <div className={`overflow-hidden border border-slate-700 shadow-xs bg-slate-800/80 ${sizeClasses[size]}`}>
          <img
            src={resolution.imageUrl!}
            alt={mp.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div
          title={`${mp.name} (${mp.party || 'MP'})`}
          className={`flex items-center justify-center font-bold tracking-wider font-mono shadow-xs border border-white/20 ${bgColors} ${sizeClasses[size]}`}
        >
          <span>{initials}</span>
        </div>
      )}

      {showBadge && (
        <span
          title={
            hasValidImage
              ? resolution.badgeLabel
              : 'Standard Identity Monogram (Verified MP Record)'
          }
          className={`absolute -bottom-1 -right-1 rounded-full p-0.5 ring-2 ring-white ${
            hasValidImage
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {hasValidImage ? (
            <ShieldCheck className={badgeSizeClasses[size]} />
          ) : (
            <UserCheck className={badgeSizeClasses[size]} />
          )}
        </span>
      )}
    </div>
  );
};
