import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  GitBranch,
  Github,
  MessageSquare,
  Route,
  Sparkles,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Connect the codebase',
    description:
      'Bring in the repository and the engineering context your team already works with.',
    icon: GitBranch,
  },
  {
    number: '02',
    title: 'Find the important paths',
    description:
      'KMS maps the surfaces, relationships, and behavioral boundaries that matter to a new engineer.',
    icon: Route,
  },
  {
    number: '03',
    title: 'Give people a place to start',
    description:
      'Turn that evidence into a focused first-week path instead of a pile of docs to read.',
    icon: Sparkles,
  },
];

const principles = [
  'Grounded in your actual codebase',
  'Built for the first week, not a documentation archive',
  'Shows what to inspect next, not just what exists',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070707] text-zinc-100">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[700px] bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.12),transparent_55%)]" />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
            <CircleDot className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-[-0.04em]">KMS</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-zinc-500 md:flex">
          <a href="#how-it-works" className="transition hover:text-zinc-200">
            How it works
          </a>
          <a href="#why-kms" className="transition hover:text-zinc-200">
            Why KMS
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden px-3 py-2 text-sm text-zinc-400 transition hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3.5 py-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Engineering onboarding, grounded in your codebase
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            Help engineers find
            <br />
            <span className="text-zinc-500">where to start.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-zinc-400 sm:text-xl">
            KMS turns an unfamiliar codebase into a focused first-week path —
            showing new engineers what matters, where it lives, and what to
            inspect next.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Start with your codebase
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-800 px-6 text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl lg:mt-24">
          <div className="absolute -inset-8 rounded-[2.5rem] bg-white/[0.025] blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0b0b] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                </div>
                <span className="ml-3 text-[11px] text-zinc-600">KMS / First 7 Days</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-700">
                Engineering ramp
              </span>
            </div>

            <div className="grid min-h-[390px] md:grid-cols-[220px_1fr]">
              <aside className="hidden border-r border-zinc-900 bg-[#090909] p-5 md:block">
                <div className="mb-7 text-xs font-medium text-white">Acme Engineering</div>
                <div className="space-y-1 text-xs">
                  <div className="rounded-lg px-3 py-2 text-zinc-600">Overview</div>
                  <div className="rounded-lg bg-white/[0.07] px-3 py-2 text-white">First 7 Days</div>
                  <div className="rounded-lg px-3 py-2 text-zinc-600">Playbooks</div>
                  <div className="rounded-lg px-3 py-2 text-zinc-600">Knowledge Health</div>
                </div>
              </aside>

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                      Software Engineer
                    </div>
                    <h2 className="mt-2 text-xl font-medium tracking-tight text-white sm:text-2xl">
                      Your first 7 days
                    </h2>
                    <p className="mt-1 text-xs text-zinc-600">
                      A focused path through the systems you&apos;ll need first.
                    </p>
                  </div>
                  <div className="hidden rounded-full border border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-500 sm:block">
                    4 learning units
                  </div>
                </div>

                <div className="mt-8 space-y-2.5">
                  {[
                    ['01', 'Understand the application entrypoints', 'Start with the HTTP boundaries and core services.', 'Ready'],
                    ['02', 'Follow the GitHub ingestion path', 'POST /github → handler → ingestion operation.', 'Next'],
                    ['03', 'Understand baseline synchronization', 'See how a repository becomes indexed context.', 'Later'],
                    ['04', 'Trace the query boundary', 'Follow a question into the query system.', 'Later'],
                  ].map(([number, title, description, status], index) => (
                    <div
                      key={number}
                      className={[
                        'group grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-xl border px-3.5 py-3.5 transition sm:grid-cols-[40px_1fr_auto]',
                        index === 1
                          ? 'border-zinc-700 bg-white/[0.045]'
                          : 'border-zinc-900 bg-zinc-950/40',
                      ].join(' ')}
                    >
                      <span className="font-mono text-[10px] text-zinc-700">{number}</span>
                      <div>
                        <div className="text-xs font-medium text-zinc-200">{title}</div>
                        <div className="mt-1 text-[10px] leading-4 text-zinc-600">{description}</div>
                      </div>
                      <span
                        className={[
                          'rounded-full px-2 py-1 text-[9px]',
                          status === 'Next'
                            ? 'bg-white text-black'
                            : 'bg-zinc-900 text-zinc-600',
                        ].join(' ')}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-[10px] text-zinc-600">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ask about any step when you need more context.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-kms" className="relative border-y border-zinc-900 bg-[#090909]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
              The problem
            </div>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              A new codebase shouldn&apos;t feel like a maze.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-500">
              Documentation tells people what a team wrote down. KMS starts
              from the system itself and helps answer the questions a new
              engineer actually has on day one.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Where do I start?', 'Find the boundaries and surfaces that matter first.'],
              ['What does this do?', 'Follow concrete implementation evidence instead of guessing from filenames.'],
              ['What should I inspect next?', 'Keep the path moving toward the next relevant piece of the system.'],
            ].map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-zinc-900 bg-[#0b0b0b] p-5">
                <div className="text-sm font-medium text-zinc-200">{question}</div>
                <div className="mt-3 text-xs leading-6 text-zinc-600">{answer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
            How KMS works
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            From codebase to a clearer first week.
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="bg-[#090909] p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-700">{step.number}</span>
                  <Icon className="h-5 w-5 text-zinc-600" />
                </div>
                <h3 className="mt-14 text-base font-medium text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid gap-10 border-t border-zinc-900 pt-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
              Built around evidence
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-white">
              Less guessing. More useful context.
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
              KMS is being built around a simple idea: onboarding guidance
              should be explainable from the engineering system, not generated
              from generic documentation templates.
            </p>
          </div>

          <div className="space-y-3">
            {principles.map((principle) => (
              <div key={principle} className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-800">
                  <Check className="h-3 w-3 text-zinc-400" />
                </div>
                {principle}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900 bg-[#090909]">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl">
            <Github className="mx-auto h-5 w-5 text-zinc-600" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Give your next engineer a better starting point.
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-500">
              Connect a codebase and see what a focused first week can look like.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Get started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="font-medium text-zinc-400">KMS</div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="transition hover:text-zinc-300">
              Sign in
            </Link>
            <Link href="/signup" className="transition hover:text-zinc-300">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
