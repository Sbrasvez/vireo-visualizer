const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("pk_test_")) return null;

  return (
    <div className="w-full bg-tertiary/20 border-b border-tertiary/40 px-4 py-2 text-center text-xs sm:text-sm text-foreground">
      Modalità test attiva — usa carta <code className="font-mono bg-card px-1.5 py-0.5 rounded">4242 4242 4242 4242</code>, qualsiasi data futura e CVC.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium"
      >
        Maggiori info
      </a>
    </div>
  );
}
