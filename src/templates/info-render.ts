/**
 * Info Carousel renderer
 *
 * Handles Satori→Resvg→Sharp rendering for BiteClub community carousel slides.
 * Content types:
 *   - cook_together       : dinner party / cook-along event promos
 *   - community_spotlight : featuring BiteClub users and their creations
 *   - biteclub_stats      : community data, top dishes, milestones
 *   - this_or_that        : fun food polls/debates for engagement
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { loadFonts } from '@/lib/fonts';
import { WIDTH, HEIGHT } from './shared';
import React from 'react';

// ── Public types ─────────────────────────────────────────────────────────────

export type InfoContentType = 'cook_together' | 'community_spotlight' | 'biteclub_stats' | 'this_or_that';

export type InfoTemplateStyle = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface CookTogetherData {
  type: 'cook_together';
  title: string;        // e.g. "Taco Tuesday Cook-Along"
  date: string;         // e.g. "March 15, 7PM CET"
  vibe: string;         // e.g. "Casual, bring your own drinks"
  menu: string[];       // dishes being cooked, one per slide
  hostName?: string;    // who's hosting
  cta?: string;         // custom CTA headline for final slide
  ctaSub?: string;      // custom CTA subtitle for final slide
}

export interface CommunitySpotlightData {
  type: 'community_spotlight';
  username: string;     // e.g. "@sarah_cooks"
  highlights: Array<{
    dish: string;       // dish name
    quote?: string;     // what they said about it
  }>;
  bio?: string;         // short bio / fun fact
  cta?: string;         // custom CTA headline for final slide
  ctaSub?: string;      // custom CTA subtitle for final slide
}

export interface BiteClubStatsData {
  type: 'biteclub_stats';
  title: string;        // e.g. "BiteClub This Week" or "2026 So Far"
  stats: Array<{
    label: string;
    value: string;
    unit?: string;
    hero?: boolean;     // mark one stat as the hero — displayed giant on its own slide
    nudge?: string;     // BiteClub tie-in line shown below the stat
  }>;
  callout?: string;     // e.g. "Most popular dish: Chicken Couscous"
  source?: string;      // e.g. "Source: Johns Hopkins Study, 2024"
  takeaway?: string;    // key takeaway text shown on a dedicated slide before CTA
  emoji?: string;       // decorative emoji rendered large & semi-transparent on slides
  cta?: string;         // custom CTA headline for final slide
  ctaSub?: string;      // custom CTA subtitle for final slide
  visual?: 'map' | 'bars' | 'ring';  // optional creative visual slide type
  barData?: Array<{ label: string; value: number; display?: string }>;
  barTitle?: string;
}

export interface ThisOrThatData {
  type: 'this_or_that';
  rounds: Array<{
    optionA: string;
    optionB: string;
  }>;
  theme?: string;       // e.g. "Breakfast Edition" or "Date Night"
  cta?: string;         // custom CTA headline for final slide
  ctaSub?: string;      // custom CTA subtitle for final slide
}

export type InfoCarouselData =
  | CookTogetherData
  | CommunitySpotlightData
  | BiteClubStatsData
  | ThisOrThatData;

// ── Palette helpers ───────────────────────────────────────────────────────────

interface Palette {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
}

function getPalette(style: InfoTemplateStyle): Palette {
  switch (style) {
    case 'A': return { bg: '#FAFAF8', surface: '#fff', text: '#1a1a1a', muted: '#888', accent: '#E63946', accentText: '#fff' };
    case 'B': return { bg: '#111', surface: '#1e1e1e', text: '#fff', muted: '#888', accent: '#E63946', accentText: '#fff' };
    case 'C': return { bg: '#FFF8F0', surface: '#fff', text: '#2a2018', muted: '#a09080', accent: '#E63946', accentText: '#fff' };
    case 'D': return { bg: '#0A0A0A', surface: '#161616', text: '#fff', muted: '#666', accent: '#E63946', accentText: '#fff' };
    case 'E': return { bg: '#F7F7F5', surface: '#fff', text: '#1a1a1a', muted: '#999', accent: '#1a1a1a', accentText: '#fff' };
    case 'F': return { bg: '#FFF3E0', surface: '#fff', text: '#1a1a1a', muted: '#888', accent: '#EF476F', accentText: '#fff' };
  }
}

function getHeadlineFont(style: InfoTemplateStyle): string {
  if (style === 'B') return 'Cormorant Garamond';
  if (style === 'A' || style === 'D' || style === 'F') return 'DM Serif Display';
  return 'DM Sans';
}

function getBorderRadius(style: InfoTemplateStyle): number {
  if (style === 'F') return 999;
  if (style === 'C') return 48;
  return 8;
}

function getCardRadius(style: InfoTemplateStyle): number {
  if (style === 'F') return 36;
  if (style === 'C') return 32;
  return 16;
}

// ── Shared slide builders ────────────────────────────────────────────────────

function buildCoverSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  headline: string,
  sub: string,
  eyebrow: string,
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';
  const dotColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  return (
    React.createElement('div', {
      style: {
        width: WIDTH, height: HEIGHT,
        background: pal.bg,
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 48,
      }
    },
      // Top accent bar — full width, thicker
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 12,
          background: pal.accent,
          display: 'flex',
        }
      }),

      // Decorative large circle — top right
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: -180, right: -140,
          width: 520, height: 520,
          borderRadius: 260,
          border: `3px solid ${dotColor}`,
          display: 'flex',
        }
      }),
      // Decorative smaller circle — top right, concentric
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: -80, right: -40,
          width: 320, height: 320,
          borderRadius: 160,
          border: `3px solid ${dotColor}`,
          display: 'flex',
        }
      }),

      // Decorative dot grid — bottom left
      React.createElement('div', {
        style: {
          position: 'absolute',
          bottom: 100, left: 70,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }
      },
        ...[0, 1, 2].map(row =>
          React.createElement('div', {
            key: `dot-row-${row}`,
            style: { display: 'flex', gap: 24 }
          },
            ...[0, 1, 2, 3].map(col =>
              React.createElement('div', {
                key: `dot-${row}-${col}`,
                style: {
                  width: 8, height: 8,
                  borderRadius: 4,
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  display: 'flex',
                }
              })
            )
          )
        )
      ),

      // Vertical accent stripe — left edge
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 12, left: 0,
          width: 6, height: 280,
          background: pal.accent,
          display: 'flex',
        }
      }),

      // Main content area
      React.createElement('div', {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '100px 90px 80px',
        }
      },
        // Category eyebrow tag — pill style with icon-like dash
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }
        },
          React.createElement('div', {
            style: {
              width: 36, height: 4,
              background: pal.accent,
              borderRadius: 2,
              display: 'flex',
            }
          }),
          React.createElement('div', {
            style: {
              background: pal.accent,
              color: pal.accentText,
              fontSize: 26,
              fontWeight: 800,
              padding: '14px 32px',
              borderRadius: getBorderRadius(style),
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              display: 'flex',
            }
          }, eyebrow)
        ),

        // Headline — large and commanding
        React.createElement('div', {
          style: {
            fontSize: 72,
            fontWeight: style === 'E' ? 200 : 800,
            color: pal.text,
            fontFamily: getHeadlineFont(style),
            lineHeight: 1.1,
            letterSpacing: style === 'E' ? '0.02em' : '-0.025em',
            marginBottom: 36,
            maxWidth: 900,
          }
        }, headline),

        // Subtitle
        sub ? React.createElement('div', {
          style: {
            fontSize: 34,
            fontWeight: 400,
            color: pal.muted,
            lineHeight: 1.5,
            maxWidth: 820,
            marginBottom: 16,
          }
        }, sub) : null,

        // Decorative divider line
        React.createElement('div', {
          style: {
            width: 80, height: 4,
            background: pal.accent,
            borderRadius: 2,
            marginTop: 48,
            marginBottom: 28,
            display: 'flex',
          }
        }),

        // Swipe prompt
        React.createElement('div', {
          style: {
            fontSize: 28,
            fontWeight: 600,
            color: pal.accent,
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }
        },
          'Swipe to explore',
          React.createElement('div', {
            style: {
              fontSize: 28,
              display: 'flex',
            }
          }, '\u2192')
        )
      )
    )
  );
}

function buildCtaSlide(style: InfoTemplateStyle, pal: Palette, ctaText?: string, ctaSubtext?: string): React.ReactElement {
  const children: React.ReactElement[] = [];

  // Top accent bar
  children.push(
    React.createElement('div', {
      key: 'accent-bar',
      style: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 9,
        background: pal.accent,
        display: 'flex',
      }
    })
  );

  // CTA headline
  children.push(
    React.createElement('div', {
      key: 'cta-headline',
      style: {
        fontSize: 58,
        fontWeight: 700,
        color: pal.text,
        fontFamily: getHeadlineFont(style),
        textAlign: 'center',
        lineHeight: 1.2,
        maxWidth: 820,
        marginBottom: 32,
      }
    }, ctaText || 'Join the club')
  );

  // CTA subtitle
  children.push(
    React.createElement('div', {
      key: 'cta-sub',
      style: {
        fontSize: 32,
        fontWeight: 400,
        color: pal.muted,
        textAlign: 'center',
        lineHeight: 1.5,
        maxWidth: 780,
        marginBottom: 54,
      }
    }, ctaSubtext || 'Cook together. Share your creations. Discover new favorites.')
  );

  // Handle
  children.push(
    React.createElement('div', {
      key: 'handle',
      style: {
        fontSize: 34,
        fontWeight: 800,
        color: pal.accent,
        letterSpacing: '0.04em',
      }
    }, '@biteclub.app')
  );

  return React.createElement('div', {
    style: {
      width: WIDTH, height: HEIGHT,
      background: pal.bg,
      fontFamily: 'DM Sans',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 48,
    }
  }, ...children);
}

// ── Cook Together slides ────────────────────────────────────────────────────

function buildCookTogetherSlides(data: CookTogetherData, style: InfoTemplateStyle): React.ReactElement[] {
  const pal = getPalette(style);
  const slides: React.ReactElement[] = [];

  slides.push(buildCoverSlide(
    style, pal,
    data.title,
    data.date + (data.hostName ? ` \u00B7 Hosted by ${data.hostName}` : ''),
    'Cook Together'
  ));

  // Vibe slide
  slides.push(
    React.createElement('div', {
      style: {
        width: WIDTH, height: HEIGHT,
        background: pal.bg,
        fontFamily: 'DM Sans',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 48,
      }
    },
      React.createElement('div', {
        style: { position: 'absolute', top: 0, left: 0, right: 0, height: style === 'B' ? '100%' : 9, width: style === 'B' ? 9 : '100%', background: pal.accent }
      }),
      React.createElement('div', {
        style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '90px 96px 60px' }
      },
        React.createElement('div', {
          style: { fontSize: 28, fontWeight: 700, color: pal.accent, letterSpacing: '0.1em', marginBottom: 32, display: 'flex' }
        }, 'THE VIBE'),
        React.createElement('div', {
          style: {
            fontSize: 46,
            fontWeight: style === 'E' ? 200 : 600,
            color: pal.text,
            fontFamily: getHeadlineFont(style),
            lineHeight: 1.35,
            marginBottom: 36,
          }
        }, data.vibe),
        React.createElement('div', {
          style: {
            background: style === 'B' || style === 'D' ? pal.surface : 'rgba(0,0,0,0.04)',
            borderRadius: getCardRadius(style),
            padding: '30px 42px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }
        },
          React.createElement('div', {
            style: { fontSize: 26, fontWeight: 600, color: pal.text, display: 'flex' }
          }, data.date),
          data.hostName ? React.createElement('div', {
            style: { fontSize: 24, fontWeight: 400, color: pal.muted, display: 'flex' }
          }, `Hosted by ${data.hostName}`) : null
        )
      )
    )
  );

  // Menu slides
  data.menu.forEach((dish, i) => {
    slides.push(
      React.createElement('div', {
        style: {
          width: WIDTH, height: HEIGHT,
          background: pal.bg,
          fontFamily: 'DM Sans',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 48,
        }
      },
        React.createElement('div', {
          style: { position: 'absolute', top: 0, left: 0, right: 0, height: style === 'B' ? '100%' : 9, width: style === 'B' ? 9 : '100%', background: pal.accent }
        }),
        React.createElement('div', {
          style: { position: 'absolute', top: 48, right: 72, fontSize: 28, fontWeight: 600, color: pal.muted, display: 'flex' }
        }, `${i + 1} / ${data.menu.length}`),
        React.createElement('div', {
          style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '90px 96px 60px' }
        },
          React.createElement('div', {
            style: { fontSize: 26, fontWeight: 700, color: pal.accent, letterSpacing: '0.1em', marginBottom: 24, display: 'flex' }
          }, 'ON THE MENU'),
          React.createElement('div', {
            style: {
              fontSize: 56,
              fontWeight: style === 'E' ? 200 : 700,
              color: pal.text,
              fontFamily: getHeadlineFont(style),
              lineHeight: 1.2,
            }
          }, dish)
        )
      )
    );
  });

  slides.push(buildCtaSlide(style, pal, data.cta, data.ctaSub));
  return slides;
}

// ── Community Spotlight slides ──────────────────────────────────────────────

function buildCommunitySpotlightSlides(data: CommunitySpotlightData, style: InfoTemplateStyle): React.ReactElement[] {
  const pal = getPalette(style);
  const slides: React.ReactElement[] = [];

  slides.push(buildCoverSlide(
    style, pal,
    `Meet ${data.username}`,
    data.bio || 'One of our favorite BiteClub members',
    'Community Spotlight'
  ));

  data.highlights.forEach((hl, i) => {
    slides.push(
      React.createElement('div', {
        style: {
          width: WIDTH, height: HEIGHT,
          background: pal.bg,
          fontFamily: 'DM Sans',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 48,
        }
      },
        React.createElement('div', {
          style: { position: 'absolute', top: 0, left: 0, right: 0, height: style === 'B' ? '100%' : 9, width: style === 'B' ? 9 : '100%', background: pal.accent }
        }),
        React.createElement('div', {
          style: { position: 'absolute', top: 48, right: 72, fontSize: 28, fontWeight: 600, color: pal.muted, display: 'flex' }
        }, `${i + 1} / ${data.highlights.length}`),
        React.createElement('div', {
          style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '90px 96px 60px' }
        },
          React.createElement('div', {
            style: { fontSize: 26, fontWeight: 700, color: pal.accent, letterSpacing: '0.1em', marginBottom: 24, display: 'flex' }
          }, data.username.toUpperCase()),
          React.createElement('div', {
            style: {
              fontSize: 50,
              fontWeight: style === 'E' ? 200 : 700,
              color: pal.text,
              fontFamily: getHeadlineFont(style),
              lineHeight: 1.2,
              marginBottom: 32,
            }
          }, hl.dish),
          hl.quote ? React.createElement('div', {
            style: {
              background: style === 'B' || style === 'D' ? pal.surface : 'rgba(0,0,0,0.04)',
              borderRadius: getCardRadius(style),
              padding: '30px 42px',
              display: 'flex',
            }
          },
            React.createElement('div', {
              style: { fontSize: 30, fontWeight: 400, color: pal.text, lineHeight: 1.5, fontStyle: 'italic' }
            }, `"${hl.quote}"`)
          ) : null
        )
      )
    );
  });

  slides.push(buildCtaSlide(style, pal, data.cta, data.ctaSub));
  return slides;
}

// ── BiteClub Stats slides ───────────────────────────────────────────────────

/** Shared slide wrapper: accent bar, optional source footer, content area */
function buildStatSlideWrapper(
  style: InfoTemplateStyle,
  pal: Palette,
  source: string | undefined,
  children: (React.ReactElement | null)[]
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';
  return React.createElement('div', {
    style: {
      width: WIDTH, height: HEIGHT,
      background: pal.bg,
      fontFamily: 'DM Sans',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 48,
    }
  },
    // Top accent bar
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 12,
        background: pal.accent,
        display: 'flex',
      }
    }),

    // Subtle corner decoration
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: -60, right: -60,
        width: 260, height: 260,
        borderRadius: 130,
        border: `3px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}`,
        display: 'flex',
      }
    }),

    // Main content
    React.createElement('div', {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 80px 60px',
      }
    }, ...children),

    // Source citation at bottom
    source ? React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 36, left: 80, right: 80,
        fontSize: 20,
        fontWeight: 400,
        color: pal.muted,
        opacity: 0.7,
        display: 'flex',
      }
    }, source) : null
  );
}

/** Hero stat slide: one giant number with subtitle, fills the page */
function buildHeroStatSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  stat: BiteClubStatsData['stats'][0],
  source: string | undefined,
): React.ReactElement {
  return buildStatSlideWrapper(style, pal, source, [
    // Section label
    React.createElement('div', {
      key: 'hero-label',
      style: {
        fontSize: 26, fontWeight: 800, color: pal.accent,
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        marginBottom: 20, display: 'flex',
      }
    }, 'KEY STAT'),

    // Centered hero block
    React.createElement('div', {
      key: 'hero-center',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }
    },
      // Accent line above the number
      React.createElement('div', {
        style: {
          width: 80, height: 6,
          background: pal.accent,
          borderRadius: 3,
          marginBottom: 48,
          display: 'flex',
        }
      }),

      // Giant value
      React.createElement('div', {
        style: {
          fontSize: 180,
          fontWeight: 900,
          color: pal.text,
          fontFamily: getHeadlineFont(style),
          lineHeight: 1.0,
          letterSpacing: '-0.04em',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
        }
      },
        stat.value,
        stat.unit ? React.createElement('span', {
          style: {
            fontSize: 72,
            fontWeight: 500,
            color: pal.muted,
            marginLeft: 12,
          }
        }, stat.unit) : null
      ),

      // Thin accent line above the label
      React.createElement('div', {
        style: {
          width: 48, height: 3,
          background: pal.accent,
          borderRadius: 2,
          marginTop: 28,
          marginBottom: 12,
          display: 'flex',
        }
      }),

      // Label below, large and clear
      React.createElement('div', {
        style: {
          fontSize: 42,
          fontWeight: 500,
          color: pal.muted,
          textAlign: 'center',
          marginTop: 12,
          lineHeight: 1.4,
          maxWidth: 750,
          display: 'flex',
        }
      }, stat.label),

      // Accent line below
      React.createElement('div', {
        style: {
          width: 80, height: 6,
          background: pal.accent,
          borderRadius: 3,
          marginTop: 48,
          display: 'flex',
        }
      }),

      // BiteClub feature callout card
      stat.nudge ? React.createElement('div', {
        style: {
          background: `${pal.accent}15`,
          borderRadius: getCardRadius(style),
          borderLeft: `5px solid ${pal.accent}`,
          padding: '24px 32px',
          marginTop: 36,
          maxWidth: 780,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }
      },
        React.createElement('div', {
          style: {
            fontSize: 20, fontWeight: 800, color: pal.accent,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            display: 'flex',
          }
        }, 'ON BITECLUB'),
        React.createElement('div', {
          style: {
            fontSize: 26, fontWeight: 500, color: pal.text,
            textAlign: 'left', lineHeight: 1.45, display: 'flex',
          }
        }, stat.nudge)
      ) : null
    ),
  ]);
}

/** Stat pair slide: 2 stats stacked large, each filling half the vertical space */
function buildStatPairSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  stats: BiteClubStatsData['stats'],
  slideIndex: number,
  totalStatSlides: number,
  source: string | undefined,
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';
  const cardBg = isDark ? pal.surface : 'rgba(0,0,0,0.04)';

  return buildStatSlideWrapper(style, pal, source, [
    // Section label + page indicator
    React.createElement('div', {
      key: 'pair-header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
      }
    },
      React.createElement('div', {
        style: {
          fontSize: 26, fontWeight: 800, color: pal.accent,
          letterSpacing: '0.12em', textTransform: 'uppercase' as const,
          display: 'flex',
        }
      }, 'BY THE NUMBERS'),
      totalStatSlides > 1 ? React.createElement('div', {
        style: {
          fontSize: 24, fontWeight: 600, color: pal.muted, display: 'flex',
        }
      }, `${slideIndex} / ${totalStatSlides}`) : null
    ),

    // Stats stacked vertically, each in a large card
    React.createElement('div', {
      key: 'pair-stats',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 32,
      }
    },
      ...stats.map((stat, i) =>
        React.createElement('div', {
          key: `stat-${i}`,
          style: {
            background: cardBg,
            borderRadius: getCardRadius(style),
            padding: '52px 56px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            borderLeft: `6px solid ${pal.accent}`,
          }
        },
          // Stat label
          React.createElement('div', {
            style: {
              fontSize: 28,
              fontWeight: 600,
              color: pal.muted,
              letterSpacing: '0.02em',
              textTransform: 'uppercase' as const,
              display: 'flex',
            }
          }, stat.label),

          // Stat value — BIG
          React.createElement('div', {
            style: {
              fontSize: 96,
              fontWeight: 900,
              color: pal.text,
              fontFamily: getHeadlineFont(style),
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
            }
          },
            stat.value,
            stat.unit ? React.createElement('span', {
              style: { fontSize: 42, fontWeight: 500, color: pal.muted }
            }, stat.unit) : null
          ),

          // BiteClub feature callout
          stat.nudge ? React.createElement('div', {
            style: {
              background: `${pal.accent}12`,
              borderRadius: Math.round(getCardRadius(style) * 0.6),
              borderLeft: `4px solid ${pal.accent}`,
              padding: '16px 20px',
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }
          },
            React.createElement('div', {
              style: {
                fontSize: 18, fontWeight: 800, color: pal.accent,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                display: 'flex',
              }
            }, 'ON BITECLUB'),
            React.createElement('div', {
              style: {
                fontSize: 22, fontWeight: 500, color: pal.text,
                lineHeight: 1.4, display: 'flex',
              }
            }, stat.nudge)
          ) : null
        )
      )
    ),
  ]);
}

/** Triple stat slide: 3 stats, first one featured large, two below in a row */
function buildStatTripleSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  stats: BiteClubStatsData['stats'],
  slideIndex: number,
  totalStatSlides: number,
  source: string | undefined,
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';
  const cardBg = isDark ? pal.surface : 'rgba(0,0,0,0.04)';
  const featured = stats[0];
  const supporting = stats.slice(1);

  return buildStatSlideWrapper(style, pal, source, [
    // Section label + page indicator
    React.createElement('div', {
      key: 'triple-header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
      }
    },
      React.createElement('div', {
        style: {
          fontSize: 26, fontWeight: 800, color: pal.accent,
          letterSpacing: '0.12em', textTransform: 'uppercase' as const,
          display: 'flex',
        }
      }, 'BY THE NUMBERS'),
      totalStatSlides > 1 ? React.createElement('div', {
        style: {
          fontSize: 24, fontWeight: 600, color: pal.muted, display: 'flex',
        }
      }, `${slideIndex} / ${totalStatSlides}`) : null
    ),

    // Featured stat — large card at top
    React.createElement('div', {
      key: 'triple-featured',
      style: {
        background: cardBg,
        borderRadius: getCardRadius(style),
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        borderLeft: `6px solid ${pal.accent}`,
        marginBottom: 28,
      }
    },
      // Label
      React.createElement('div', {
        style: {
          fontSize: 26, fontWeight: 600, color: pal.muted,
          letterSpacing: '0.02em', textTransform: 'uppercase' as const,
          display: 'flex',
        }
      }, featured.label),
      React.createElement('div', {
        style: {
          fontSize: 100, fontWeight: 900, color: pal.text,
          fontFamily: getHeadlineFont(style), letterSpacing: '-0.03em',
          lineHeight: 1.0, display: 'flex', alignItems: 'baseline', gap: 12,
        }
      },
        featured.value,
        featured.unit ? React.createElement('span', {
          style: { fontSize: 44, fontWeight: 500, color: pal.muted }
        }, featured.unit) : null
      ),
      // BiteClub feature callout
      featured.nudge ? React.createElement('div', {
        style: {
          background: `${pal.accent}12`,
          borderRadius: Math.round(getCardRadius(style) * 0.6),
          borderLeft: `4px solid ${pal.accent}`,
          padding: '16px 20px',
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }
      },
        React.createElement('div', {
          style: {
            fontSize: 18, fontWeight: 800, color: pal.accent,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            display: 'flex',
          }
        }, 'ON BITECLUB'),
        React.createElement('div', {
          style: {
            fontSize: 22, fontWeight: 500, color: pal.text,
            lineHeight: 1.4, display: 'flex',
          }
        }, featured.nudge)
      ) : null
    ),

    // Two supporting stats side by side
    React.createElement('div', {
      key: 'triple-supporting',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: 24,
      }
    },
      ...supporting.map((stat, i) =>
        React.createElement('div', {
          key: `support-${i}`,
          style: {
            flex: 1,
            background: cardBg,
            borderRadius: getCardRadius(style),
            padding: '40px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 12,
            borderTop: `5px solid ${pal.accent}`,
          }
        },
          // Label
          React.createElement('div', {
            style: {
              fontSize: 24, fontWeight: 600, color: pal.muted,
              letterSpacing: '0.02em', textTransform: 'uppercase' as const,
              display: 'flex',
            }
          }, stat.label),
          React.createElement('div', {
            style: {
              fontSize: 72, fontWeight: 900, color: pal.text,
              fontFamily: getHeadlineFont(style), letterSpacing: '-0.03em',
              lineHeight: 1.0, display: 'flex', alignItems: 'baseline', gap: 8,
            }
          },
            stat.value,
            stat.unit ? React.createElement('span', {
              style: { fontSize: 32, fontWeight: 500, color: pal.muted }
            }, stat.unit) : null
          ),
          // BiteClub feature callout
          stat.nudge ? React.createElement('div', {
            style: {
              background: `${pal.accent}12`,
              borderRadius: Math.round(getCardRadius(style) * 0.5),
              borderLeft: `3px solid ${pal.accent}`,
              padding: '12px 14px',
              marginTop: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }
          },
            React.createElement('div', {
              style: {
                fontSize: 14, fontWeight: 800, color: pal.accent,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                display: 'flex',
              }
            }, 'ON BITECLUB'),
            React.createElement('div', {
              style: {
                fontSize: 18, fontWeight: 500, color: pal.text,
                lineHeight: 1.35, display: 'flex',
              }
            }, stat.nudge)
          ) : null
        )
      )
    ),
  ]);
}

/** Callout banner slide: full-width highlighted block with the callout text */
function buildCalloutSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  callout: string,
  source: string | undefined,
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';

  return buildStatSlideWrapper(style, pal, source, [
    React.createElement('div', {
      key: 'callout-center',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }
    },
      // Accent icon block
      React.createElement('div', {
        style: {
          width: 72, height: 72,
          borderRadius: 36,
          background: pal.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 48,
        }
      },
        React.createElement('div', {
          style: { fontSize: 36, fontWeight: 900, color: pal.accentText }
        }, '!')
      ),

      // Full-width banner card
      React.createElement('div', {
        style: {
          width: '100%',
          background: isDark ? pal.surface : `${pal.accent}11`,
          borderRadius: getCardRadius(style),
          padding: '56px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderLeft: `8px solid ${pal.accent}`,
        }
      },
        React.createElement('div', {
          style: {
            fontSize: 24, fontWeight: 800, color: pal.accent,
            letterSpacing: '0.12em', textTransform: 'uppercase' as const,
            marginBottom: 24, display: 'flex',
          }
        }, 'HIGHLIGHT'),
        React.createElement('div', {
          style: {
            fontSize: 46,
            fontWeight: 700,
            color: pal.text,
            fontFamily: getHeadlineFont(style),
            textAlign: 'center',
            lineHeight: 1.35,
            maxWidth: 780,
          }
        }, callout)
      )
    ),
  ]);
}

// ── Creative visual slide builders ──────────────────────────────────────────

const DEFAULT_HOTSPOTS: Array<{ label: string; x: number; y: number; size: 'lg' | 'md' | 'sm' }> = [
  { label: 'United States', x: 22, y: 42, size: 'lg' as const },
  { label: 'Denmark', x: 52, y: 30, size: 'md' as const },
  { label: 'Sweden', x: 53, y: 28, size: 'md' as const },
  { label: 'Norway', x: 51, y: 24, size: 'sm' as const },
  { label: 'France', x: 49, y: 36, size: 'sm' as const },
  { label: 'India', x: 68, y: 48, size: 'sm' as const },
];

const FLAG_DATA: Record<string, string> = {
  'United States': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik0yNTYgMGgyNTZ2NjRsLTMyIDMyIDMyIDMydjY0bC0zMiAzMiAzMiAzMnY2NGwtMzIgMzIgMzIgMzJ2NjRsLTI1NiAzMkwwIDQ0OHYtNjRsMzItMzItMzItMzJ2LTY0eiIvPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik0yMjQgNjRoMjg4djY0SDIyNFptMCAxMjhoMjg4djY0SDI1NlpNMCAzMjBoNTEydjY0SDBabTAgMTI4aDUxMnY2NEgwWiIvPjxwYXRoIGZpbGw9IiMwMDUyYjQiIGQ9Ik0wIDBoMjU2djI1NkgwWiIvPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Im0xODcgMjQzIDU3LTQxaC03MGw1NyA0MS0yMi02N3ptLTgxIDAgNTctNDFIOTNsNTcgNDEtMjItNjd6bS04MSAwIDU3LTQxSDEybDU3IDQxLTIyLTY3em0xNjItODEgNTctNDFoLTcwbDU3IDQxLTIyLTY3em0tODEgMCA1Ny00MUg5M2w1NyA0MS0yMi02N3ptLTgxIDAgNTctNDFIMTJsNTcgNDEtMjItNjdabTE2Mi04MiA1Ny00MWgtNzBsNTcgNDEtMjItNjdabS04MSAwIDU3LTQxSDkzbDU3IDQxLTIyLTY3em0tODEgMCA1Ny00MUgxMmw1NyA0MS0yMi02N1oiLz48L2c+PC9zdmc+',
  'Sweden': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiMwMDUyYjQiIGQ9Ik0wIDBoMTMzLjZsMzUuMyAxNi43TDIwMC4zIDBINTEydjIyMi42bC0yMi42IDMxLjcgMjIuNiAzNS4xVjUxMkgyMDAuM2wtMzItMTkuOC0zNC43IDE5LjhIMFYyODkuNGwyMi4xLTMzLjNMMCAyMjIuNnoiLz48cGF0aCBmaWxsPSIjZmZkYTQ0IiBkPSJNMTMzLjYgMHYyMjIuNkgwdjY2LjhoMTMzLjZWNTEyaDY2LjdWMjg5LjRINTEydi02Ni44SDIwMC4zVjB6Ii8+PC9nPjwvc3ZnPg==',
  'Denmark': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik0wIDBoMTMzLjZsMzIuNyAyMC4zIDM0LTIwLjNINTEydjIyMi42TDQ5MS40IDI1NmwyMC42IDMzLjRWNTEySDIwMC4zbC0zMS43LTIwLjQtMzUgMjAuNEgwVjI4OS40bDI5LjQtMzNMMCAyMjIuN3oiLz48cGF0aCBmaWxsPSIjZWVlIiBkPSJNMTMzLjYgMHYyMjIuNkgwdjY2LjhoMTMzLjZWNTEyaDY2LjdWMjg5LjRINTEydi02Ni44SDIwMC4zVjBoLTY2Ljd6Ii8+PC9nPjwvc3ZnPg==',
  'Norway': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik0wIDBoMTAwLjJsNjYuMSA1My41TDIzMy43IDBINTEydjE4OS4zTDQ2Ni4zIDI1N2w0NS43IDY1LjhWNTEySDIzMy43bC02OC01MC43LTY1LjUgNTAuN0gwVjMyMi44bDUxLjQtNjguNS01MS40LTY1eiIvPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik0xMDAuMiAwdjE4OS4zSDB2MzMuNGwyNC42IDMzTDAgMjg5LjV2MzMuNGgxMDAuMlY1MTJoMzMuNGwzMC42LTI2LjMgMzYuMSAyNi4zaDMzLjRWMzIyLjhINTEydi0zMy40bC0yNC42LTMzLjcgMjQuNi0zM3YtMzMuNEgyMzMuN1YwaC0zMy40bC0zMy44IDI1LjNMMTMzLjYgMHoiLz48cGF0aCBmaWxsPSIjMDA1MmI0IiBkPSJNMTMzLjYgMHYyMjIuN0gwdjY2LjdoMTMzLjZWNTEyaDY2LjdWMjg5LjRINTEydi02Ni43SDIwMC4zVjB6Ii8+PC9nPjwvc3ZnPg==',
  'Netherlands': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Im0wIDE2NyAyNTMuOC0xOS4zTDUxMiAxNjd2MTc4bC0yNTQuOSAzMi4zTDAgMzQ1eiIvPjxwYXRoIGZpbGw9IiNhMjAwMWQiIGQ9Ik0wIDBoNTEydjE2N0gweiIvPjxwYXRoIGZpbGw9IiMwMDUyYjQiIGQ9Ik0wIDM0NWg1MTJ2MTY3SDB6Ii8+PC9nPjwvc3ZnPg==',
  'France': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik0xNjcgMGgxNzhsMjUuOSAyNTIuM0wzNDUgNTEySDE2N2wtMjkuOC0yNTMuNHoiLz48cGF0aCBmaWxsPSIjMDA1MmI0IiBkPSJNMCAwaDE2N3Y1MTJIMHoiLz48cGF0aCBmaWxsPSIjZDgwMDI3IiBkPSJNMzQ1IDBoMTY3djUxMkgzNDV6Ii8+PC9nPjwvc3ZnPg==',
  'India': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Im0wIDE2MCAyNTYtMzIgMjU2IDMydjE5MmwtMjU2IDMyTDAgMzUyeiIvPjxwYXRoIGZpbGw9IiNmZjk4MTEiIGQ9Ik0wIDBoNTEydjE2MEgwWiIvPjxwYXRoIGZpbGw9IiM2ZGE1NDQiIGQ9Ik0wIDM1Mmg1MTJ2MTYwSDBaIi8+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSI3MiIgZmlsbD0iIzAwNTJiNCIvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iNDgiIGZpbGw9IiNlZWUiLz48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI0IiBmaWxsPSIjMDA1MmI0Ii8+PC9nPjwvc3ZnPg==',
  'Mexico': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik0xNDQgMGgyMjNsMzMgMjU2LTMzIDI1NkgxNDRsLTMyLTI1NnoiLz48cGF0aCBmaWxsPSIjZDgwMDI3IiBkPSJNMzY4IDBoMTQ0djUxMkgzNjh6Ii8+PHBhdGggZmlsbD0iIzc1MWE0NiIgZD0iTTI1NiAxNzRjMjIgMTEgMTIgMzMgMTEgMzRsLTItNGMtNC0xNS0xMy0zMy0zMS0xOHYxMXExMCAxIDExIDExLTExIDEyLTQgMjZsNCA4LTEzIDIzIDI5LTcgMTggMTh2LTExbDExIDExIDIzLTExLTM1LTIxLTItMTNjMjItMiAzNCA0IDUxIDI5IDktODMtNDUtODYtNjQtODZaIi8+PHBhdGggZmlsbD0iIzZkYTU0NCIgZD0iTTIwOSAxODNxLTUgNC00IDEyIDEgMTEgMTAgMTVjMyAyIDggMCAxMCAzIDMgMy0yIDUtNCA2cS04IDUtOSAxNCAzIDEwIDEyIDE1YzIgMiA3IDQgNSA3cS00IDItOS0yLTEyLTYtMTktMTljLTItMy0xLTEwLTctMTAtNyAyLTQgMTAtMiAxNHE4IDE0IDIxIDIzIDkgOCAyMCAzIDEwLTYgNC0xN2MtMy02LTExLTgtMTQtMTQtMi0zIDItNCA0LTZxOC00IDktMTEtMi0xMy0xNC0xNS02IDEtNy02Yy0xLTMgMy03IDAtMTFxLTItMy02LTEiLz48cGF0aCBmaWxsPSIjNDk2ZTJkIiBkPSJNMCAwdjUxMmgxNDRWMHptMTY0IDIzNWE1IDUgMCAwIDAtNSA1IDk3IDk3IDAgMCAwIDE5NCAwIDUgNSAwIDAgMC01LTUgNSA1IDAgMCAwLTUgNSA4NyA4NyAwIDEgMS0xNzQgMCA1IDUgMCAwIDAtNS01bTM1IDI1LTQgMXEtMyA0IDEgOCAyMyAyMSA1NCAyNHYxN2gxMnYtMTdxMzEtMyA1NC0yNCA0LTQgMS04LTQtMy04IDBhNzggNzggMCAwIDEtMTA2IDB6Ii8+PHBhdGggZmlsbD0iIzMzOGFmMyIgZD0iTTI1NiAzMTZxLTIxIDAtNDAtMTNsNi05YzIwIDEzIDQ4IDEzIDY4IDBsNyA5cS0xOCAxMy00MSAxMyIvPjxyZWN0IHdpZHRoPSIzNCIgaGVpZ2h0PSIyMiIgeD0iMjM5IiB5PSIyOTkiIGZpbGw9IiNmZjk4MTEiIHJ4PSIxMSIgcnk9IjExIi8+PHBhdGggZmlsbD0iI2ZmZGE0NCIgZD0ibTIzNCAxODYtMTIgMTF2MTFsMTgtOXE0LTMgMS03em0tNjIgNzlhMTAgMTAgMCAwIDAtMTAgMTAgMTAgMTAgMCAwIDAgMTAgMTAgMTAgMTAgMCAwIDAgMTAtMTAgMTAgMTAgMCAwIDAtMTAtMTBtMTY5IDBhMTAgMTAgMCAwIDAtMTAgMTAgMTAgMTAgMCAwIDAgMTAgMTAgMTAgMTAgMCAwIDAgMTAtMTAgMTAgMTAgMCAwIDAtMTAtMTBtLTY5IDQtMTYgOHY1bDE1LTEgNC05em0tODMgMjNhMTAgMTAgMCAwIDAtMTAgMTAgMTAgMTAgMCAwIDAgMTAgMTAgMTAgMTAgMCAwIDAgMTAtMTAgMTAgMTAgMCAwIDAtMTAtMTBtMTM1IDBhMTAgMTAgMCAwIDAtMTAgMTAgMTAgMTAgMCAwIDAgMTAgMTAgMTAgMTAgMCAwIDAgMTAtMTAgMTAgMTAgMCAwIDAtMTAtMTBtLTEwOCAyMWExMCAxMCAwIDAgMC0xMCAxMCAxMCAxMCAwIDAgMCAxMCAxMCAxMCAxMCAwIDAgMCAxMC0xMCAxMCAxMCAwIDAgMC0xMC0xMG04MSAwYTEwIDEwIDAgMCAwLTEwIDEwIDEwIDEwIDAgMCAwIDEwIDEwIDEwIDEwIDAgMCAwIDEwLTEwIDEwIDEwIDAgMCAwLTEwLTEwIi8+PC9nPjwvc3ZnPg==',
  'Portugal': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiM2ZGE1NDQiIGQ9Ik0wIDUxMmgxNjdsMzcuOS0yNjAuM0wxNjcgMEgweiIvPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik01MTIgMEgxNjd2NTEyaDM0NXoiLz48Y2lyY2xlIGN4PSIxNjciIGN5PSIyNTYiIHI9Ijg5IiBmaWxsPSIjZmZkYTQ0Ii8+PHBhdGggZmlsbD0iI2Q4MDAyNyIgZD0iTTExNi45IDIxMS41VjI2N2E1MCA1MCAwIDEgMCAxMDAuMSAwdi01NS42SDExN3oiLz48cGF0aCBmaWxsPSIjZWVlIiBkPSJNMTY3IDI4My44Yy05LjIgMC0xNi43LTcuNS0xNi43LTE2LjdWMjQ1aDMzLjR2MjJjMCA5LjItNy41IDE2LjctMTYuNyAxNi43eiIvPjwvZz48L3N2Zz4=',
  'Palestine': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik00MS4zIDEyMS45IDUxMiAxNjd2MTc4TDQzLjggMzkxLjN6Ii8+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTAgMGg1MTJ2MTY3SDExMXoiLz48cGF0aCBmaWxsPSIjNmRhNTQ0IiBkPSJNMTExIDM0NWg0MDF2MTY3SDB6Ii8+PHBhdGggZmlsbD0iI2Q4MDAyNyIgZD0iTTAgMHY1MTJsMjU2LTI1NnoiLz48L2c+PC9zdmc+',
  'Germany': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNmZmRhNDQiIGQ9Im0wIDM0NSAyNTYuNy0yNS41TDUxMiAzNDV2MTY3SDB6Ii8+PHBhdGggZmlsbD0iI2Q4MDAyNyIgZD0ibTAgMTY3IDI1NS0yMyAyNTcgMjN2MTc4SDB6Ii8+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTAgMGg1MTJ2MTY3SDB6Ii8+PC9nPjwvc3ZnPg==',
  'United Kingdom': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Im0wIDAgOCAyMi04IDIzdjIzbDMyIDU0LTMyIDU0djMybDMyIDQ4LTMyIDQ4djMybDMyIDU0LTMyIDU0djY4bDIyLTggMjMgOGgyM2w1NC0zMiA1NCAzMmgzMmw0OC0zMiA0OCAzMmgzMmw1NC0zMiA1NCAzMmg2OGwtOC0yMiA4LTIzdi0yM2wtMzItNTQgMzItNTR2LTMybC0zMi00OCAzMi00OHYtMzJsLTMyLTU0IDMyLTU0VjBsLTIyIDgtMjMtOGgtMjNsLTU0IDMyLTU0LTMyaC0zMmwtNDggMzItNDgtMzJoLTMybC01NCAzMkw2OCAwSDB6Ii8+PHBhdGggZmlsbD0iIzAwNTJiNCIgZD0iTTMzNiAwdjEwOEw0NDQgMFptMTc2IDY4TDQwNCAxNzZoMTA4ek0wIDE3NmgxMDhMMCA2OFpNNjggMGwxMDggMTA4VjBabTEwOCA1MTJWNDA0TDY4IDUxMlpNMCA0NDRsMTA4LTEwOEgwWm01MTItMTA4SDQwNGwxMDggMTA4Wm0tNjggMTc2TDMzNiA0MDR2MTA4eiIvPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik0wIDB2NDVsMTMxIDEzMWg0NUwwIDB6bTIwOCAwdjIwOEgwdjk2aDIwOHYyMDhoOTZWMzA0aDIwOHYtOTZIMzA0VjBoLTk2em0yNTkgMEwzMzYgMTMxdjQ1TDUxMiAwaC00NXpNMTc2IDMzNiAwIDUxMmg0NWwxMzEtMTMxdi00NXptMTYwIDAgMTc2IDE3NnYtNDVMMzgxIDMzNmgtNDV6Ii8+PC9nPjwvc3ZnPg==',
  'Spain': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNmZmRhNDQiIGQ9Im0wIDEyOCAyNTYtMzIgMjU2IDMydjI1NmwtMjU2IDMyTDAgMzg0WiIvPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik0xOTYgMTY4cS0xMSAxLTE1IDExbC01LTFxLTE1IDEtMTYgMTZjLTEgMTUgNyAxNiAxNiAxNnExMSAwIDE1LTExYTE2IDE2IDAgMCAwIDE3LTQgMTYgMTYgMCAwIDAgMTcgNCAxNiAxNiAwIDEgMCAxMC0yMCAxNiAxNiAwIDAgMC0yNy01cS00LTYtMTItNm0wIDhxOCAxIDggOCAwIDgtOCA4LTcgMC04LTggMS03IDgtOG0yNCAwcTggMSA4IDggMCA4LTggOC03IDAtOC04IDEtNyA4LThtLTQ0IDEwIDQgMSA0IDhxLTEgNy04IDctOSAwLTgtOCAxLTcgOC04bTY0IDBxOCAxIDggOCAwIDgtOCA0LTcgMC04LTdsNC04em0tMTEyIDM4djgwaDE2di04MHptODAgMHY0MGMtMjYgMC00OCAxNC00OCAzMnMyMiAzMiA0OCAzMiA0OC0xNCA0OC0zMnYtNzJ6bTY0IDB2ODBoMTZ2LTgweiIvPjxwYXRoIGZpbGw9IiNmZjk4MTEiIGQ9Ik0yMDAgMTYwaDE2djMyaC0xNnoiLz48cGF0aCBmaWxsPSIjZDgwMDI3IiBkPSJNMCAwdjEyOGg1MTJWMHptMjA4IDE4NGMtMjIgMC00MCAxMS00MCAyNGw4IDhoNjRsOC04YzAtMTMtMTgtMjQtNDAtMjRtLTcyIDhhOCA4IDAgMCAwLTggOHY4YTggOCAwIDEgMCAxNiAwdi04YTggOCAwIDAgMC04LThtMTQ0IDBhOCA4IDAgMCAwLTggOHY4YTggOCAwIDEgMCAxNiAwdi04YTggOCAwIDAgMC04LThtLTEyMCAzMnYyNGgtMzhhNCA0IDAgMCAwLTQgNCA0IDQgMCAwIDAgNCA0aDM4djQwYTI0IDI0IDAgMCAwIDI0IDI0IDI0IDI0IDAgMCAwIDI0LTI0IDI0IDI0IDAgMCAwIDI0IDI0IDI0IDI0IDAgMCAwIDI0LTI0di0yNGgtNDh2LTQ4em03MiA4YTEwIDEwIDAgMCAwLTEwIDEwdjEyYTEwIDEwIDAgMSAwIDIwIDB2LTEyYTEwIDEwIDAgMCAwLTEwLTEwbTI0IDE2djhoMzhhNCA0IDAgMCAwIDQtNCA0IDQgMCAwIDAtNC00em0tMTM0IDI0YTQgNCAwIDAgMC00IDQgNCA0IDAgMCAwIDQgNGgyOGE0IDQgMCAwIDAgNC00IDQgNCAwIDAgMC00LTR6bTE0NCAwYTQgNCAwIDAgMC00IDQgNCA0IDAgMCAwIDQgNGgyOGE0IDQgMCAwIDAgNC00IDQgNCAwIDAgMC00LTR6TTAgMzg0djEyOGg1MTJWMzg0eiIvPjxwYXRoIGZpbGw9IiNmZmRhNDQiIGQ9Ik0xODYgMTk2YTYgNiAwIDAgMC02IDYgNiA2IDAgMCAwIDYgNiA2IDYgMCAwIDAgNi02IDYgNiAwIDAgMC02LTZtMjIgMGE2IDYgMCAwIDAtNiA2IDYgNiAwIDAgMCA2IDYgNiA2IDAgMCAwIDYtNiA2IDYgMCAwIDAtNi02bTIyIDBhNiA2IDAgMCAwLTYgNiA2IDYgMCAwIDAgNiA2IDYgNiAwIDAgMCA2LTYgNiA2IDAgMCAwLTYtNiIvPjxwYXRoIGZpbGw9IiNmZjk4MTEiIGQ9Ik0xMjggMjA4YTggOCAwIDEgMCAwIDE2aDE2YTggOCAwIDEgMCAwLTE2em0xNDQgMGE4IDggMCAxIDAgMCAxNmgxNmE4IDggMCAxIDAgMC0xNnptLTk2IDh2OGg2NHYtOHptLTggMTZ2OGg4djE2aC04djhoMzJ2LThoLTh2LTE2aDh2LTh6bS04IDQwdjI0cTEgMTIgOSAxOXYtNDN6bTE5IDB2NDdoMTB2LTQ3em0yMCAwdjQzcTktNyA5LTE5di0yNHptLTcxIDMyYTggOCAwIDEgMCAwIDE2aDE2YTggOCAwIDEgMCAwLTE2em0xNDQgMGE4IDggMCAxIDAgMCAxNmgxNmE4IDggMCAxIDAgMC0xNnoiLz48cGF0aCBmaWxsPSIjMzM4YWYzIiBkPSJNMjA4IDI1NmExNiAxNiAwIDAgMC0xNiAxNiAxNiAxNiAwIDAgMCAxNiAxNiAxNiAxNiAwIDAgMCAxNi0xNiAxNiAxNiAwIDAgMC0xNi0xNm0tODAgNjRhOCA4IDAgMSAwIDAgMTZoMTZhOCA4IDAgMSAwIDAtMTZ6bTE0NCAwYTggOCAwIDEgMCAwIDE2aDE2YTggOCAwIDEgMCAwLTE2eiIvPjwvZz48L3N2Zz4=',
  'Italy': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik0xNjcgMGgxNzhsMjUuOSAyNTIuM0wzNDUgNTEySDE2N2wtMjkuOC0yNTMuNHoiLz48cGF0aCBmaWxsPSIjNmRhNTQ0IiBkPSJNMCAwaDE2N3Y1MTJIMHoiLz48cGF0aCBmaWxsPSIjZDgwMDI3IiBkPSJNMzQ1IDBoMTY3djUxMkgzNDV6Ii8+PC9nPjwvc3ZnPg==',
  'Japan': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik0wIDBoNTEydjUxMkgweiIvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMTExLjMiIGZpbGw9IiNkODAwMjciLz48L2c+PC9zdmc+',
  'Australia': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiMwMDUyYjQiIGQ9Ik0wIDBoNTEydjUxMkgweiIvPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Im0xNTQgMzAwIDE0IDMwIDMyLTgtMTQgMzAgMjUgMjAtMzIgNyAxIDMzLTI2LTIxLTI2IDIxIDEtMzMtMzMtNyAyNi0yMC0xNC0zMCAzMiA4em0yMjItMjdoNDdsLTM4IDI3IDE1LTQ0IDE0IDQ0em03LTE2MiA3IDE1IDE2LTQtNyAxNSAxMiAxMC0xNSAzdjE3bC0xMy0xMS0xMyAxMXYtMTdsLTE1LTMgMTItMTAtNy0xNSAxNiA0em01NyA2NyA3IDE1IDE2LTQtNyAxNSAxMiAxMC0xNSAzdjE2bC0xMy0xMC0xMyAxMXYtMTdsLTE1LTMgMTItMTAtNy0xNSAxNiA0em0tMTIyIDIyIDcgMTUgMTYtNC03IDE1IDEyIDEwLTE1IDN2MTZsLTEzLTEwLTEzIDExdi0xN2wtMTUtMyAxMi0xMC03LTE1IDE2IDR6bTY1IDE1NiA3IDE1IDE2LTQtNyAxNSAxMiAxMC0xNSAzdjE3bC0xMy0xMS0xMyAxMXYtMTdsLTE1LTMgMTItMTAtNy0xNSAxNiA0ek0wIDB2MzJsMzIgMzJMMCA5NnYxNjBoMzJsMzItMzIgMzIgMzJoMzJ2LTgzbDgzIDgzaDQ1bC04LTE2IDgtMTV2LTE0bC04My04M2g4M1Y5NmwtMzItMzIgMzItMzJWMEg5Nkw2NCAzMiAzMiAwWiIvPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik0zMiAwdjMySDB2NjRoMzJ2MTYwaDY0Vjk2aDE2MFYzMkg5NlYwWm05NiAxMjggMTI4IDEyOHYtMzFsLTk3LTk3eiIvPjwvZz48L3N2Zz4=',
  'Canada': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Ik0wIDB2NTEyaDE0NGwxMTItNjQgMTEyIDY0aDE0NFYwSDM2OEwyNTYgNjQgMTQ0IDBaIi8+PHBhdGggZmlsbD0iI2VlZSIgZD0iTTE0NCAwaDIyNHY1MTJIMTQ0WiIvPjxwYXRoIGZpbGw9IiNkODAwMjciIGQ9Im0zMDEgMjg5IDQ0LTIyLTIyLTExdi0yMmwtNDUgMjIgMjMtNDRoLTIzbC0yMi0zNC0yMiAzM2gtMjNsMjMgNDUtNDUtMjJ2MjJsLTIyIDExIDQ1IDIyLTEyIDIzaDQ1djMzaDIydi0zM2g0NXoiLz48L2c+PC9zdmc+',
  'Brazil': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PG1hc2sgaWQ9ImEiPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjxnIG1hc2s9InVybCgjYSkiPjxwYXRoIGZpbGw9IiM2ZGE1NDQiIGQ9Ik0wIDBoNTEydjUxMkgweiIvPjxwYXRoIGZpbGw9IiNmZmRhNDQiIGQ9Ik0yNTYgMTAwLjIgNDY3LjUgMjU2IDI1NiA0MTEuOCA0NC41IDI1NnoiLz48cGF0aCBmaWxsPSIjZWVlIiBkPSJNMTc0LjIgMjIxYTg3IDg3IDAgMCAwLTcuMiAzNi4zbDE2MiA0OS44YTg4LjUgODguNSAwIDAgMCAxNC40LTM0Yy00MC42LTY1LjMtMTE5LjctODAuMy0xNjkuMS01MnoiLz48cGF0aCBmaWxsPSIjMDA1MmI0IiBkPSJNMjU1LjcgMTY3YTg5IDg5IDAgMCAwLTQxLjkgMTAuNiA4OSA4OSAwIDAgMC0zOS42IDQzLjQgMTgxLjcgMTgxLjcgMCAwIDEgMTY5LjEgNTIuMiA4OSA4OSAwIDAgMC05LTU5LjQgODkgODkgMCAwIDAtNzguNi00Ni44ek0yMTIgMjUwLjVhMTQ5IDE0OSAwIDAgMC00NSA2LjggODkgODkgMCAwIDAgMTAuNSA0MC45IDg5IDg5IDAgMCAwIDEyMC42IDM2LjIgODkgODkgMCAwIDAgMzAuNy0yNy4zQTE1MSAxNTEgMCAwIDAgMjEyIDI1MC41eiIvPjwvZz48L3N2Zz4=',
};

function buildMapSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  hotspots: Array<{ label: string; x: number; y: number; size: 'lg' | 'md' | 'sm' }>,
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';
  const cardBg = isDark ? pal.surface : 'rgba(0,0,0,0.04)';
  const cardRadius = getCardRadius(style);

  // Sort by size priority (lg > md > sm) and take top 6
  const sizePriority = { lg: 3, md: 2, sm: 1 };
  const topSix = [...hotspots]
    .sort((a, b) => sizePriority[b.size] - sizePriority[a.size])
    .slice(0, 6);

  // Map size to display count
  const sizeToCount: Record<string, number> = { lg: 421, md: 86, sm: 14 };
  const sizeToLabel: Record<string, string> = { lg: '400+ cooks', md: '20+ cooks', sm: '5+ cooks' };
  const maxCount = Math.max(...topSix.map(s => sizeToCount[s.size]));

  // Border thickness: top countries get thicker left border
  const sizeToBorder: Record<string, number> = { lg: 6, md: 4, sm: 3 };

  // Grid layout constants
  const gridTop = 340;
  const gridLeft = 72;
  const gridRight = 72;
  const colGap = 28;
  const rowGap = 24;
  const colWidth = (WIDTH - gridLeft - gridRight - colGap) / 2;
  const cardHeight = 178;

  // Build country cards
  const countryCards: React.ReactElement[] = [];
  topSix.forEach((spot, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = gridLeft + col * (colWidth + colGap);
    const y = gridTop + row * (cardHeight + rowGap);
    const count = sizeToCount[spot.size];
    const barWidth = Math.max(24, (count / maxCount) * (colWidth - 100));
    const flagSrc = FLAG_DATA[spot.label] || null;

    countryCards.push(
      React.createElement('div', {
        key: `card-${i}`,
        style: {
          position: 'absolute',
          top: y,
          left: x,
          width: colWidth,
          height: cardHeight,
          background: cardBg,
          borderRadius: cardRadius,
          borderLeft: `${sizeToBorder[spot.size]}px solid ${pal.accent}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 32px',
          gap: 10,
        },
      },
        // Top row: flag + country name
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          },
        },
          flagSrc
            ? React.createElement('img', {
                src: flagSrc,
                width: 48,
                height: 48,
                style: {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  display: 'flex',
                },
              })
            : React.createElement('div', {
                style: {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  background: pal.accent,
                  display: 'flex',
                },
              }),
          React.createElement('div', {
            style: {
              fontSize: 32,
              fontWeight: 700,
              color: pal.text,
              display: 'flex',
            },
          }, spot.label),
        ),
        // Count pill
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          },
        },
          React.createElement('div', {
            style: {
              background: pal.accent,
              color: pal.accentText,
              fontSize: 20,
              fontWeight: 700,
              padding: '4px 16px',
              borderRadius: 999,
              display: 'flex',
            },
          }, sizeToLabel[spot.size]),
        ),
        // Mini bar chart
        React.createElement('div', {
          style: {
            display: 'flex',
            width: '100%',
            height: 8,
            borderRadius: 4,
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            overflow: 'hidden',
          },
        },
          React.createElement('div', {
            style: {
              width: barWidth,
              height: 8,
              borderRadius: 4,
              background: pal.accent,
              opacity: 1 - i * 0.08,
              display: 'flex',
            },
          }),
        ),
      )
    );
  });

  // Bottom stats
  const bottomStats = [
    { value: `${hotspots.length}`, label: 'Countries' },
    { value: '580+', label: 'Active Cooks' },
    { value: '120+', label: 'Meals This Week' },
  ];

  return React.createElement('div', {
    style: {
      width: WIDTH,
      height: HEIGHT,
      background: pal.bg,
      fontFamily: 'DM Sans',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 48,
    },
  },
    // Top accent bar
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 12,
        background: pal.accent,
        display: 'flex',
      },
    }),

    // Header area
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 70, left: 72, right: 72,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      },
    },
      React.createElement('div', {
        style: {
          fontSize: 26,
          fontWeight: 800,
          color: pal.accent,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          display: 'flex',
        },
      }, 'WHERE BITECLUB COOKS'),
      React.createElement('div', {
        style: {
          width: 60, height: 4,
          background: pal.accent,
          borderRadius: 2,
          display: 'flex',
        },
      }),
      React.createElement('div', {
        style: {
          fontSize: 28,
          fontWeight: 400,
          color: pal.muted,
          marginTop: 8,
          display: 'flex',
        },
      }, 'Real cooks from around the world'),
    ),

    // Country cards grid
    ...countryCards,

    // Bottom stats row
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 72, left: 72, right: 72,
        display: 'flex',
        gap: 20,
      },
    },
      ...bottomStats.map((stat, i) =>
        React.createElement('div', {
          key: `bstat-${i}`,
          style: {
            flex: 1,
            background: cardBg,
            borderRadius: cardRadius,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          },
        },
          React.createElement('div', {
            style: {
              fontSize: 36,
              fontWeight: 800,
              color: pal.accent,
              display: 'flex',
            },
          }, stat.value),
          React.createElement('div', {
            style: {
              fontSize: 20,
              fontWeight: 500,
              color: pal.muted,
              display: 'flex',
            },
          }, stat.label),
        )
      )
    ),
  );
}

function buildBarChartSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  title: string,
  bars: Array<{ label: string; value: number; display?: string }>,
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';
  const maxValue = Math.max(...bars.map(b => b.value), 1);
  const maxBarWidth = WIDTH * 0.60;  // 80% of slide width for the longest bar
  const barHeight = 56;
  const barGap = 20;
  const startY = 320;
  const labelWidth = 220;
  const barLeft = 80 + labelWidth + 20;

  const barElements: React.ReactElement[] = [];
  bars.forEach((bar, i) => {
    const y = startY + i * (barHeight + barGap);
    const barWidth = Math.max(40, (bar.value / maxValue) * maxBarWidth);
    const opacity = Math.max(0.35, 1 - i * 0.12);
    const rowBg = i % 2 === 0
      ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
      : 'transparent';

    // Alternating row background
    barElements.push(
      React.createElement('div', {
        key: `row-bg-${i}`,
        style: {
          position: 'absolute',
          top: y - 8,
          left: 60,
          right: 60,
          height: barHeight + 16,
          borderRadius: 12,
          background: rowBg,
          display: 'flex',
        },
      })
    );

    // Label
    barElements.push(
      React.createElement('div', {
        key: `label-${i}`,
        style: {
          position: 'absolute',
          top: y,
          left: 80,
          width: labelWidth,
          height: barHeight,
          display: 'flex',
          alignItems: 'center',
          fontSize: 28,
          fontWeight: 600,
          color: pal.text,
        },
      }, bar.label)
    );

    // Bar
    barElements.push(
      React.createElement('div', {
        key: `bar-${i}`,
        style: {
          position: 'absolute',
          top: y + 6,
          left: barLeft,
          width: barWidth,
          height: barHeight - 12,
          borderRadius: (barHeight - 12) / 2,
          background: i === 0 ? pal.accent : pal.accent,
          opacity,
          display: 'flex',
        },
      })
    );

    // Value display
    barElements.push(
      React.createElement('div', {
        key: `value-${i}`,
        style: {
          position: 'absolute',
          top: y,
          left: barLeft + barWidth + 16,
          height: barHeight,
          display: 'flex',
          alignItems: 'center',
          fontSize: 26,
          fontWeight: 700,
          color: i === 0 ? pal.accent : pal.muted,
        },
      }, bar.display || String(bar.value))
    );
  });

  return React.createElement('div', {
    style: {
      width: WIDTH,
      height: HEIGHT,
      background: pal.bg,
      fontFamily: 'DM Sans',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 48,
    },
  },
    // Top accent bar
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 12,
        background: pal.accent,
        display: 'flex',
      },
    }),

    // Title area
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 70, left: 80, right: 80,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      },
    },
      React.createElement('div', {
        style: {
          fontSize: 26,
          fontWeight: 800,
          color: pal.accent,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          display: 'flex',
        },
      }, title),
      React.createElement('div', {
        style: {
          width: 60, height: 4,
          background: pal.accent,
          borderRadius: 2,
          display: 'flex',
        },
      })
    ),

    // Rank numbers on the left
    ...bars.map((_, i) =>
      React.createElement('div', {
        key: `rank-${i}`,
        style: {
          position: 'absolute',
          top: startY + i * (barHeight + barGap),
          left: 80,
          height: barHeight,
          display: 'flex',
          alignItems: 'center',
          fontSize: 22,
          fontWeight: 800,
          color: i === 0 ? pal.accent : pal.muted,
          opacity: 0.5,
        },
      }, `#${i + 1}`)
    ),

    // Bars
    ...barElements,

    // Footer accent line
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 80, left: 80,
        width: 80, height: 4,
        background: pal.accent,
        borderRadius: 2,
        display: 'flex',
      },
    }),
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 96, left: 80,
        fontSize: 22,
        fontWeight: 500,
        color: pal.muted,
        display: 'flex',
      },
    }, '@biteclub.app')
  );
}

function buildRingGaugeSlide(
  style: InfoTemplateStyle,
  pal: Palette,
  stat: { label: string; value: string; unit?: string; nudge?: string },
  source?: string,
): React.ReactElement {
  const isDark = style === 'B' || style === 'D';
  const ringSize = 360;
  const outerGlowSize = 420;
  const innerDetailSize = 300;

  return buildStatSlideWrapper(style, pal, source, [
    // Section label
    React.createElement('div', {
      key: 'ring-label',
      style: {
        fontSize: 26, fontWeight: 800, color: pal.accent,
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        marginBottom: 20, display: 'flex',
      },
    }, 'KEY STAT'),

    // Centered ring + number block
    React.createElement('div', {
      key: 'ring-center',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
      // Ring container (relative for layering)
      React.createElement('div', {
        style: {
          width: outerGlowSize,
          height: outerGlowSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        },
      },
        // Outer glow ring
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: 0, left: 0,
            width: outerGlowSize,
            height: outerGlowSize,
            borderRadius: outerGlowSize / 2,
            border: `2px solid ${pal.accent}`,
            opacity: 0.15,
            display: 'flex',
          },
        }),

        // Main accent ring
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: (outerGlowSize - ringSize) / 2,
            left: (outerGlowSize - ringSize) / 2,
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            border: `14px solid ${pal.accent}`,
            display: 'flex',
          },
        }),

        // Inner detail ring
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: (outerGlowSize - innerDetailSize) / 2,
            left: (outerGlowSize - innerDetailSize) / 2,
            width: innerDetailSize,
            height: innerDetailSize,
            borderRadius: innerDetailSize / 2,
            border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex',
          },
        }),

        // Value centered inside ring
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
          React.createElement('div', {
            style: {
              fontSize: 120,
              fontWeight: 900,
              color: pal.text,
              fontFamily: getHeadlineFont(style),
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
            },
          },
            stat.value,
            stat.unit ? React.createElement('span', {
              style: {
                fontSize: 48,
                fontWeight: 500,
                color: pal.muted,
                marginLeft: 8,
              },
            }, stat.unit) : null
          )
        )
      ),

      // Label below the ring
      React.createElement('div', {
        style: {
          fontSize: 38,
          fontWeight: 500,
          color: pal.muted,
          textAlign: 'center',
          marginTop: 36,
          lineHeight: 1.4,
          maxWidth: 700,
          display: 'flex',
        },
      }, stat.label),

      // Accent line
      React.createElement('div', {
        style: {
          width: 60, height: 4,
          background: pal.accent,
          borderRadius: 2,
          marginTop: 32,
          display: 'flex',
        },
      }),

      // BiteClub nudge card
      stat.nudge ? React.createElement('div', {
        style: {
          background: `${pal.accent}15`,
          borderRadius: getCardRadius(style),
          borderLeft: `5px solid ${pal.accent}`,
          padding: '24px 32px',
          marginTop: 32,
          maxWidth: 780,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        },
      },
        React.createElement('div', {
          style: {
            fontSize: 20, fontWeight: 800, color: pal.accent,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            display: 'flex',
          },
        }, 'ON BITECLUB'),
        React.createElement('div', {
          style: {
            fontSize: 26, fontWeight: 500, color: pal.text,
            textAlign: 'left', lineHeight: 1.45, display: 'flex',
          },
        }, stat.nudge)
      ) : null
    ),
  ]);
}

function buildBiteClubStatsSlides(data: BiteClubStatsData, style: InfoTemplateStyle): React.ReactElement[] {
  const pal = getPalette(style);
  const slides: React.ReactElement[] = [];
  const source = data.source;

  // 1. Cover slide
  slides.push(buildCoverSlide(
    style, pal,
    data.title,
    data.callout || '',
    'BiteClub Data',
  ));

  // 2. Visual slide insertion (map, bars, or ring replaces hero)
  if (data.visual === 'map') {
    slides.push(buildMapSlide(style, pal, DEFAULT_HOTSPOTS));
  } else if (data.visual === 'bars' && data.barData && data.barData.length > 0) {
    slides.push(buildBarChartSlide(style, pal, data.barTitle || 'RANKINGS', data.barData));
  }

  // 3. Separate hero stat(s) from regular stats
  const heroStat = data.stats.find(s => s.hero);
  const regularStats = data.stats.filter(s => !s.hero);

  // 4. Hero stat slide — use ring gauge if visual === 'ring', otherwise standard hero
  if (data.visual === 'ring' && heroStat) {
    slides.push(buildRingGaugeSlide(style, pal, heroStat, source));
  } else if (data.visual === 'ring' && data.stats.length === 1) {
    slides.push(buildRingGaugeSlide(style, pal, data.stats[0], source));
  } else if (heroStat) {
    slides.push(buildHeroStatSlide(style, pal, heroStat, source));
  } else if (data.stats.length === 1) {
    slides.push(buildHeroStatSlide(style, pal, data.stats[0], source));
  }

  // 5. Regular stats — split into slides of 2-3 for readability
  const statsToLayout = heroStat ? regularStats : (data.stats.length === 1 ? [] : regularStats.length > 0 ? regularStats : data.stats);

  if (statsToLayout.length > 0) {
    // Decide chunking: groups of 2 or 3 depending on total count
    const chunks: BiteClubStatsData['stats'][] = [];
    let remaining = [...statsToLayout];

    while (remaining.length > 0) {
      if (remaining.length === 3) {
        // Exactly 3 left — use a triple layout
        chunks.push(remaining.splice(0, 3));
      } else if (remaining.length <= 2) {
        chunks.push(remaining.splice(0, 2));
      } else if (remaining.length === 4) {
        // 4 = 2 + 2
        chunks.push(remaining.splice(0, 2));
      } else if (remaining.length % 3 === 0) {
        // Divisible by 3 — use triples
        chunks.push(remaining.splice(0, 3));
      } else {
        // Default: take 2, leave remainder for next iteration
        chunks.push(remaining.splice(0, 2));
      }
    }

    const totalStatSlides = chunks.length;

    chunks.forEach((chunk, i) => {
      if (chunk.length === 3) {
        slides.push(buildStatTripleSlide(style, pal, chunk, i + 1, totalStatSlides, source));
      } else if (chunk.length === 2) {
        slides.push(buildStatPairSlide(style, pal, chunk, i + 1, totalStatSlides, source));
      } else {
        // Single stat in a chunk — give it the hero treatment
        slides.push(buildHeroStatSlide(style, pal, chunk[0], source));
      }
    });
  }

  // 6. Combined takeaway + CTA — callout merged into CTA as takeaway
  slides.push(buildCtaSlide(style, pal, data.cta, data.ctaSub));
  return slides;
}

// ── This or That slides ─────────────────────────────────────────────────────

function buildThisOrThatSlides(data: ThisOrThatData, style: InfoTemplateStyle): React.ReactElement[] {
  const pal = getPalette(style);
  const slides: React.ReactElement[] = [];

  slides.push(buildCoverSlide(
    style, pal,
    'This or That?',
    data.theme ? `${data.theme} \u00B7 ${data.rounds.length} rounds` : `${data.rounds.length} rounds — pick your side`,
    data.theme || 'Food Debate'
  ));

  data.rounds.forEach((round, i) => {
    slides.push(
      React.createElement('div', {
        style: {
          width: WIDTH, height: HEIGHT,
          background: pal.bg,
          fontFamily: 'DM Sans',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 48,
        }
      },
        React.createElement('div', {
          style: { position: 'absolute', top: 0, left: 0, right: 0, height: style === 'B' ? '100%' : 9, width: style === 'B' ? 9 : '100%', background: pal.accent }
        }),
        React.createElement('div', {
          style: { position: 'absolute', top: 48, right: 72, fontSize: 28, fontWeight: 600, color: pal.muted, display: 'flex' }
        }, `Round ${i + 1}`),

        // VS layout
        React.createElement('div', {
          style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 72px' }
        },
          // Option A
          React.createElement('div', {
            style: {
              width: '100%',
              background: style === 'B' || style === 'D' ? pal.surface : 'rgba(0,0,0,0.04)',
              borderRadius: getCardRadius(style),
              padding: '36px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }
          },
            React.createElement('div', {
              style: {
                fontSize: 44,
                fontWeight: style === 'E' ? 200 : 700,
                color: pal.text,
                fontFamily: getHeadlineFont(style),
                textAlign: 'center',
              }
            }, round.optionA)
          ),

          // VS circle
          React.createElement('div', {
            style: {
              width: 64, height: 64,
              borderRadius: 32,
              background: pal.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }
          },
            React.createElement('div', {
              style: { fontSize: 26, fontWeight: 800, color: pal.accentText }
            }, 'VS')
          ),

          // Option B
          React.createElement('div', {
            style: {
              width: '100%',
              background: style === 'B' || style === 'D' ? pal.surface : 'rgba(0,0,0,0.04)',
              borderRadius: getCardRadius(style),
              padding: '36px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          },
            React.createElement('div', {
              style: {
                fontSize: 44,
                fontWeight: style === 'E' ? 200 : 700,
                color: pal.text,
                fontFamily: getHeadlineFont(style),
                textAlign: 'center',
              }
            }, round.optionB)
          ),

          // Comment prompt
          React.createElement('div', {
            style: {
              marginTop: 36,
              fontSize: 26,
              fontWeight: 600,
              color: pal.muted,
              display: 'flex',
            }
          }, 'Comment your pick!')
        )
      )
    );
  });

  slides.push(buildCtaSlide(style, pal, data.cta, data.ctaSub));
  return slides;
}

// ── Main export ───────────────────────────────────────────────────────────────

let fontsPromise: ReturnType<typeof loadFonts> | null = null;
function getFonts() {
  if (!fontsPromise) fontsPromise = loadFonts();
  return fontsPromise;
}

async function renderJsxToJpeg(element: React.ReactElement, fonts: Awaited<ReturnType<typeof loadFonts>>): Promise<Buffer> {
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts as Parameters<typeof satori>[1]['fonts'],
  });

  const RENDER_WIDTH = Math.round(WIDTH * 0.6);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: RENDER_WIDTH } });
  const pngBuffer = resvg.render().asPng();

  return sharp(pngBuffer)
    .resize(WIDTH, HEIGHT, { kernel: 'lanczos3' })
    .jpeg({ quality: 88 })
    .toBuffer();
}

export async function generateInfoCarousel(
  data: InfoCarouselData,
  style: InfoTemplateStyle
): Promise<Buffer[]> {
  const fonts = await getFonts();

  let slideElements: React.ReactElement[];

  switch (data.type) {
    case 'cook_together':        slideElements = buildCookTogetherSlides(data, style); break;
    case 'community_spotlight':  slideElements = buildCommunitySpotlightSlides(data, style); break;
    case 'biteclub_stats':       slideElements = buildBiteClubStatsSlides(data, style); break;
    case 'this_or_that':         slideElements = buildThisOrThatSlides(data, style); break;
  }

  return Promise.all(slideElements.map((el) => renderJsxToJpeg(el, fonts)));
}
