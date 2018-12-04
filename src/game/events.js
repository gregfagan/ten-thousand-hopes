import {
  propEq,
  cond,
  pipe,
  identity,
  always,
  T,
  prepend,
  evolve,
  allPass,
  gt,
  gte,
  partialRight,
  compose,
  not,
  over,
  add,
  __,
} from 'ramda'

import { lensEq, lensSatisfies } from '../ramda-ext'
import initialState from './state'
import step, {
  time,
  nextEvent,
  crew,
  kill,
  waste,
  embryos,
  destroyEmbryos,
  intensiveCare,
} from './sim'
import { reallocate } from './power'

const event = (
  description,
  condition = T,
  options = [option('Continue')],
  isOutcome = false,
) => ({
  description,
  condition,
  options,
  isOutcome,
})

const option = (
  text,
  outcome = undefined,
  effect = identity,
  stepAfter = true,
) => ({
  text,
  effect: pipe(
    effect,
    outcome
      ? pipe(
          prependOutcomeEvent(outcome),
          nextEvent,
        )
      : stepAfter
      ? step
      : identity,
  ),
})

const restartOption = option('Start over', undefined, () => initialState, false)

const terminalEvent = partialRight(event, [[restartOption], false])

const outcomeEvent = description =>
  event(description, undefined, undefined, true)

const prependOutcomeEvent = description =>
  evolve({
    possibleEvents: prepend(outcomeEvent(description)),
  })

const radiationEventOutcome = crewDeaths =>
  pipe(
    kill(crewDeaths),
    over(intensiveCare)(add(5 - crewDeaths)),
    destroyEmbryos(1486),
  )

const colonyThrives = lensSatisfies(gte(__, 25), crew)
const colonySurvives = lensSatisfies(gte(__, 8), crew)
const colonyDespair = lensSatisfies(gt(__, 1), crew)

const colonyOutcome = cond([
  [
    colonyThrives,
    always(
      `Not everyone made it, but there are enough of us left that we should be able to build up a healthy colony. With the living crew, we have enough personnel to work all of the equipment that was sent ahead of us, and we can excavate and fortify ourselves from the sun's radiation. It's not Earth, but after that journey, there is no group of people I'd rather be around.`,
    ),
  ],
  [
    colonySurvives,
    always(
      `We took quite a beating to get here. There are still enough of us -- just barely -- to operate the equipment and get a settlement going. Unfortunately we won't be able to fill every job. Survival is going to be rough, but we just might be able to do it.`,
    ),
  ],
  [
    colonyDespair,
    always(
      `Only a few of us survived. I've tried to keep their hopes up, but sooner or later they'll figure out that there aren't enough of us to sustain ourselves; too much work and too few people. This was it. Humanity's last stand. At least we have each other.`,
    ),
  ],
  [
    T,
    always(
      `It's just me. I'm all alone. I'll never see another person again. I'm not sure how long I'll last... not very. What's the point though? There's no way I can carry on. Could I have saved us? What if I had chosen differently? I'm humanity's final failure.`,
    ),
  ],
])

const colonyTooSmall = compose(
  not,
  colonySurvives,
)
const humanityThrives = lensSatisfies(gte(__, 4000), embryos)
const humanitySurvives = lensSatisfies(gte(__, 1000), embryos)
const tooFewEmbryos = lensSatisfies(gte(__, 1), embryos)
const noEmbryos = lensEq(embryos, 0)

const humanitysOutcome = cond([
  [
    noEmbryos,
    always(
      `Just getting to Mars was not the point. We have no future for humanity without those embryos. What could I have done differently? How many could have been saved? I guess I'll have the rest of my life to wonder. We had a good run. Achieved some incredible things... but the last human child has already died, and there is no future...`,
    ),
  ],
  [
    colonyTooSmall,
    always(
      `The embryos are irrelevant. There's not enough people left to operate the equipment and raise the children. That's it then. The end of the species.`,
    ),
  ],
  [
    humanityThrives,
    always(
      `Humanity has hope. We have enough embryos to restart and a large enough colony to support them. Mars is harsh, and not Earth, but we are survivors. We will rebuild, we will forge on.`,
    ),
  ],
  [
    humanitySurvives,
    always(
      `We've lost a lot of our future children and their genetic diversity. There might still be enough for us to build a stable population, but it is far from certain. Luckily there's enough crew around to help raise them and give us the best shot we can hope for, at least with what we have left. Here's to hope.`,
    ),
  ],
  [
    tooFewEmbryos,
    always(
      `The population projections aren't good for the number of embryos that survived. We can raise the next generation, but most likely there will be a collapse not long after. We'll have to make the best of our limited time left as a species... we tried. We tried so hard. It just wasn't enough.`,
    ),
  ],
])

const terminalEvents = [
  terminalEvent(
    state => `
Mars at last.

${colonyOutcome(state)}

${humanitysOutcome(state)}

This will be my final log. The ship is grounded and I'm not a commander anymore. I'm just a civilian... a Martian. If only the people of Earth could see it.
`,
    propEq('time', 50),
  ),
  terminalEvent(
    `
Can't... go... on...
`,
    lensEq(crew, 0),
  ),
  terminalEvent(
    `
cnt breath help hlp helsiojkdmxc v
`,
    lensEq(waste, 1),
  ),
]

export default [
  //
  // Game start
  //
  event(`
Does it even make sense to talk of the date on Earth anymore? The meteor completely annihilated it. Oh God... how can this be happening? It's all gone so fast. We've had less than a year to prepare, to grieve and accept our fate, but nothing can prepare you for actually witnessing it.

This rocket, its fifty crew, and our cargo of cyrogenically frozen embryos represent the only hope to stave off extinction. Can we even make it to Mars? If we do, will we be able to survive?

NASA's best only gave us "something south of 20%" chances. I think they were actually trying to give us hope. With as little warning as we had, it's a miracle we got this rocket in the sky at all. Let's hope it holds together.

I've never been much for religion, but I'm praying now. Please, God, have mercy on our poor souls...`),
  //
  // Game end
  //
  ...terminalEvents,

  //
  // Other events
  //
  event(
    `
Trouble already. There was a violent collision, the whole ship shook worse than lift off. It was probably debris knocked out of earth orbit by the impact. It wouldn't take much delta V for even a satellite screw to end this mission before we've barely left the neighborhood.

The good news is we're still alive, and the hull wasn't compromised. It was a glancing blow.

The bad news is that we had to burn a significant amount of our reserve fuel to correct course, and it took out most of one of the solar arrays.

The solar array presents a real problem. We were on a tight power budget already; and now we don't even have enough to fully power the critical systems: life support, cyrogenics, hydroponics.

I'll have to make some tough choices here.

The life support systems recycle the air and human waste. This is the most critical; nothing else will matter if carbon dioxide builds up and we suffocate.

Cryogenics represents the future of the species. Ten thousand human embryos... all that's left, besides us of course. Without full power, we can't run all of the freezers, and we'll start losing them. I've consulted with Dr. Miller, and she tells me that while there has been plenty of theorizing about the minimum viable human population, no one really knows. We can't afford to lose too many of our children.

Finally, we have a stockpile of rations, but without fully powering the grow lights and other hydroponics systems, we won't be producing enough food to keep up with consumption. There wasn't enough cargo space for food for the whole trip, plus we'll need the crops when we get to Mars anyway. If we don't keep up with food production, in a couple of months we'll be starving.

Clark says that we can afford to divert some power away from life support to the other systems for a little while, but if the supply of breathable air drops too far we'll need to shift it back. It's going to be a balancing act.

Anderson has been studying the imagery from the cameras and drones and thinks that if we could get out there and replace some of the couplers, the panels might still produce enough power to make a difference. Not everything we need, but we'd be better off than we are now.

The problem is that we're really still flying blind here. We didn't see whatever hit us, and even though space is huge, that meteor flung a lot of high speed debris. We occasionally hear pings from smaller bits bouncing off the hull.

Anderson's plan is risky. It requires 3 crew in an approximately 4 hour EVA. If anything else hits us or there is some problem, we might not be able to get them back.

I'm exhausted. I need to get some rest and think this over.

A quick note about the crew: Hitchens almost completely lost it when that thing hit us. Dr. Amin gave him a seditive, but I think PTSD is going to be something most of us will struggle with.`,
    propEq('time', 1),
    [
      option(
        'Order the repair mission',
        `
I should have listened to my instincts. Anderson, Wu, and Yorke went out to make the repairs. Around the third hour, while working on the second coupler, we got hit again. A piece of it smashed directly into Yorke.. he was obliterated. Anderson was tethered to him. They're both gone. I'm not sure if Anderson survived the impact, but if he did, he has just over an hour of oxygen left. The thought of him tumbling through space, alone and hopeless... not to mention Yorke, who was a good kid.

Wu made it back, but everyone is badly shaken by what's happened.

Their work did restore about a quarter of the original capacity of the array. It's not much, but it might be enough to save some lives down the line.

Anderson and Yorke. Their sacrifice will be remembered.`,
        pipe(
          kill(2),
          reallocate('hydroponics', 2),
          reallocate('cryoStorage', 2),
          reallocate('lifeSupport', 3),
        ),
      ),
      option(
        'Leave it alone',
        `
Well, it was good that we didn't send anyone out there. Another large chunk of debris hit us and pretty much took out the rest of that array. We're going to be low on power, but it could be worse.

Let's hope it's not worse.
`,
        pipe(
          reallocate('hydroponics', 2),
          reallocate('cryoStorage', 2),
          reallocate('lifeSupport', 2),
        ),
      ),
    ],
  ),

  event(
    `
Things keep getting worse. We got hit with an unxpected blast of radiation from a solar flare. The ship is shielded as best as it can be but some sections had to be left more exposed -- in particular, one of the lower sections of cryo storage was extremely exposed. We've lost all of the embryos there, just under 1,500 of them. At this point that represents a significant portion of humanity, which makes that solar flare one of the greatest tragedies, behind, of course, the meteor.

It's worse than that. The five crewmembers that were there -- Ackerman, Nguyen, O'Brien, Rosenfield, and Kraus -- were badly injured. Dr. Amin tells me the dose they received was definitely mortal. The cries of pain... you can hear everything in this ship. She gives them only a few months at most.

Rosenfield, when he was lucid, realized his fate and asked to be given a less painful death. I can't say I blame him. Nguyen overheard and was shocked -- despite the pain he wants to hang on and fight for his life. Amin tells me that's unrealistic.

The other three are comatose and probably won't ever wake.

Here's the problem: the intensive care equipment we're running to keep them alive drastically reduces the efficency of the other life support systems.

They have no future, but in the present they're stretching our already tight resources to the breaking point. Should I grant Rosenfield his request? What about the rest of them? Do we shoulder the burden of keeping them alive, when we're doomed to fail? This mission isn't getting any easier.

God what a horror.
`,
    allPass([
      lensSatisfies(gte(__, 25), time),
      lensSatisfies(gte(__, 7), crew),
      pipe(
        Math.random,
        gt(__, 0.8),
      ),
    ]),
    [
      option(
        'Euthanize Rosenfield',
        `
I'm going to grant Rosenfield his wish. It's the only humane thing to do, and I can't bear to see him suffer. Nguyen still wants to hang on, and the others -- well I don't feel right making that kind of choice for them. Who knows, there's always a chance... and we need as much hope as we can get right now.
`,
        radiationEventOutcome(1),
      ),
      option(
        'Euthanize all but Nguyen',
        `Rosenfield wants out, so I'm going to let him go. Nguyen wants to stay and fight. Truly admirable, so he will stay. The others -- with no chance of recovery and the strain on our resources, I've made the difficult decision to let them go too. May they find the peace we all seek.`,
        radiationEventOutcome(4),
      ),
      option(
        'Euthanize them all',
        `
I have to be realistic. We're barely holding on as it is, and it was tragic what happened to them, but we can't save them now. The less resources we consume the better chance we have of making it to Mars.

Rosenfield will get his wish. Nguyen... I ordered Amin to do it when he was sleeping. I think it's better for him and the rest of us this way.

The others, I can only hope their souls forgive me for what I've done. Sacrifices must be made.
`,
        radiationEventOutcome(5),
      ),
      option(
        'Do nothing',
        `
Rosenfield and Nguyen, though in pain, are still occasionally lucid. They have some time left in their lives, and while they're members of my crew I still need their help. No, they won't be servicing the life support or cyro systems, but they have valuable knowledge that we can't just give up.

It will be tough for them, but this is a mission of survival. Perseverence is paramount and the crew will be well served by their example of sacrifice.

The truth is, after everything we've been through, I just can't bring myself to give the order. Every human life seems too precious to forsake.
`,
        radiationEventOutcome(0),
      ),
    ],
  ),
  //
  // If no other event happened this step
  //
  event('Nothing of interest to report.'),
]
