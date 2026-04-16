import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="relative rounded-3xl bg-primary overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center">
          {/* Decorations */}
          <div className="absolute top-0 right-0 size-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 size-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-white/10 mb-8">
              <Leaf className="size-8 text-primary-foreground" />
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Pronto a cambiare il mondo,<br />un piatto alla volta?
            </h2>
            <p className="text-primary-foreground/75 text-lg max-w-lg mx-auto mb-10">
              Unisciti a migliaia di persone che stanno già vivendo in modo più sostenibile con Vireo.
            </p>

            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-8 rounded-xl shadow-lg"
              asChild
            >
              <Link to="/signup">
                Crea il tuo account gratuito
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}