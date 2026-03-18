'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import type { CheckoutStep } from '@/types/checkout';

const STEPS: CheckoutStep[] = ['delivery', 'shipping', 'payment', 'review'];

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  onStepClick: (step: CheckoutStep) => void;
  completedSteps: Set<CheckoutStep>;
}

export function CheckoutProgress({ currentStep, onStepClick, completedSteps }: CheckoutProgressProps) {
  const t = useTranslations('checkout');

  const stepLabels: Record<CheckoutStep, string> = {
    delivery: t('stepDelivery'),
    shipping: t('stepShipping'),
    payment: t('stepPayment'),
    review: t('stepReview'),
  };

  const currentIndex = STEPS.indexOf(currentStep);
  const progressPercent = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <nav aria-label="Checkout progress" className="mb-6 md:mb-8">
      <div
        className="sm:hidden rounded-2xl border px-4 py-3"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
        data-testid="mobile-checkout-progress"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-muted-foreground)' }}>
            {t('title')}
          </p>
          <p className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
            {currentIndex + 1} / {STEPS.length}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }} data-testid="mobile-checkout-progress-current">
            {stepLabels[currentStep]}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {Array.from(completedSteps).length} complete
          </p>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div
            className="h-full rounded-full transition-all duration-fast"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-primary)' }}
          />
        </div>
      </div>

      <ol className="hidden items-center sm:flex">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(step);
          const isCurrent = step === currentStep;
          const isClickable = isCompleted || index <= currentIndex;

          return (
            <li key={step} className="flex items-center flex-1 last:flex-initial">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className="flex flex-col items-center gap-1.5 group disabled:cursor-default"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-fast"
                  style={{
                    backgroundColor: isCompleted
                      ? 'var(--color-primary)'
                      : isCurrent
                        ? 'var(--color-primary)'
                        : 'var(--color-muted)',
                    color: isCompleted || isCurrent ? 'white' : 'var(--color-muted-foreground)',
                  }}
                >
                  {isCompleted ? <Check className="w-4 h-4" aria-hidden="true" /> : index + 1}
                </div>
                <span
                  className="text-[11px] font-medium hidden sm:block"
                  style={{
                    color: isCurrent ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  }}
                >
                  {stepLabels[step]}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2"
                  style={{
                    backgroundColor: completedSteps.has(STEPS[index])
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                  }}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
