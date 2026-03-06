import React from 'react';
import { Composition } from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { linearTiming } from '@remotion/transitions';
import { ScreenSlide } from './ScreenSlide';
import screensManifest from './screens.json';

export const Root: React.FC = () => {
  const { width, height, fps } = screensManifest.videoConfig;

  const totalDuration = screensManifest.screens.reduce((acc, s) => acc + s.duration, 0) * fps;

  return (
    <>
      <Composition
        id="Walkthrough"
        component={() => (
          <TransitionSeries>
            {screensManifest.screens.map((screen, index) => (
              <React.Fragment key={screen.id}>
                <TransitionSeries.Sequence durationInFrames={screen.duration * fps}>
                  <ScreenSlide
                    imageSrc={screen.imagePath}
                    title={screen.title}
                    description={screen.description}
                    width={width}
                    height={height}
                  />
                </TransitionSeries.Sequence>
                {index < screensManifest.screens.length - 1 && (
                  <TransitionSeries.Transition
                    presentation={screen.transitionType === 'slide' ? slide() : fade()}
                    timing={linearTiming({ durationInFrames: 30 })}
                  />
                )}
              </React.Fragment>
            ))}
          </TransitionSeries>
        )}
        durationInFrames={totalDuration}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};

import { registerRoot } from 'remotion';
registerRoot(Root);
