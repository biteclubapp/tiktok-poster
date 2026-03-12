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
  }>;
  callout?: string;     // e.g. "Most popular dish: Chicken Couscous"
  source?: string;      // e.g. "Source: Johns Hopkins Study, 2024"
  takeaway?: string;    // key takeaway text shown on a dedicated slide before CTA
  emoji?: string;       // decorative emoji rendered large & semi-transparent on slides
  cta?: string;         // custom CTA headline for final slide
  ctaSub?: string;      // custom CTA subtitle for final slide
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
  return (
    React.createElement('div', {
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
    },
      // Top accent bar
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 9,
          background: pal.accent,
          display: 'flex',
        }
      }),

      React.createElement('div', {
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
      }, ctaText || 'Join the club'),

      React.createElement('div', {
        style: {
          fontSize: 32,
          fontWeight: 400,
          color: pal.muted,
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: 780,
          marginBottom: 54,
        }
      }, ctaSubtext || 'Cook together. Share your creations. Discover new favorites.'),

      React.createElement('div', {
        style: {
          fontSize: 34,
          fontWeight: 800,
          color: pal.accent,
          letterSpacing: '0.04em',
        }
      }, '@biteclub.app')
    )
  );
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
      })
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
          )
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
      )
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
          )
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

/** Key takeaway slide: big bold message that summarizes everything */
function buildTakeawaySlide(
  style: InfoTemplateStyle,
  pal: Palette,
  takeaway: string,
  source: string | undefined,
): React.ReactElement {

  return buildStatSlideWrapper(style, pal, source, [
    React.createElement('div', {
      key: 'takeaway-center',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
      }
    },
      // Top accent line
      React.createElement('div', {
        style: {
          width: 60, height: 6,
          background: pal.accent,
          borderRadius: 3,
          marginBottom: 52,
          display: 'flex',
        }
      }),

      // Section label
      React.createElement('div', {
        style: {
          fontSize: 26, fontWeight: 800, color: pal.accent,
          letterSpacing: '0.14em', textTransform: 'uppercase' as const,
          marginBottom: 40, display: 'flex',
        }
      }, 'KEY TAKEAWAY'),

      // Big takeaway text
      React.createElement('div', {
        style: {
          fontSize: 58,
          fontWeight: style === 'E' ? 300 : 800,
          color: pal.text,
          fontFamily: getHeadlineFont(style),
          textAlign: 'center',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          maxWidth: 840,
        }
      }, takeaway),

      // Bottom accent line
      React.createElement('div', {
        style: {
          width: 60, height: 6,
          background: pal.accent,
          borderRadius: 3,
          marginTop: 52,
          display: 'flex',
        }
      })
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

  // 2. Separate hero stat(s) from regular stats
  const heroStat = data.stats.find(s => s.hero);
  const regularStats = data.stats.filter(s => !s.hero);

  // 3. Hero stat slide (if one is marked, or if there's only 1 stat)
  if (heroStat) {
    slides.push(buildHeroStatSlide(style, pal, heroStat, source));
  } else if (data.stats.length === 1) {
    slides.push(buildHeroStatSlide(style, pal, data.stats[0], source));
  }

  // 4. Regular stats — split into slides of 2-3 for readability
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

  // 5. Callout banner slide (if callout exists)
  if (data.callout) {
    slides.push(buildCalloutSlide(style, pal, data.callout, source));
  }

  // 6. Key takeaway slide (if provided, shown before CTA)
  if (data.takeaway) {
    slides.push(buildTakeawaySlide(style, pal, data.takeaway, source));
  }

  // 7. CTA
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
