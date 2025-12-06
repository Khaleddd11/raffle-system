"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { GRADES } from "@/lib/grades";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validation";

type SubmissionResult = {
  raffleNumber: number;
  smsSent: boolean;
  smsError?: string;
  parentPhone: string;
  kidName: string;
  grade: string;
  dateOfBirth: string;
  parentName: string;
  issuedAt: string;
};

type RegistrationFormProps = {
  onSuccess: (result: SubmissionResult) => void;
};

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      kidName: "",
      dateOfBirth: "",
      grade: undefined as unknown as RegistrationInput["grade"],
      parentName: "",
      parentPhone: "",
      smsConsent: false,
    },
  });

  const onSubmit = async (values: RegistrationInput) => {
    setServerError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error ??
        data?.errors?.kidName?.[0] ??
        data?.errors?.parentPhone?.[0] ??
        "Registration failed. Please try again.";
      setServerError(message);
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
      return;
    }

    const mergedResult: SubmissionResult = {
      ...(data as SubmissionResult),
      grade: values.grade,
      dateOfBirth: values.dateOfBirth,
      parentName: values.parentName,
      issuedAt: (data as SubmissionResult).issuedAt,
    };

    onSuccess(mergedResult);
    form.reset({
      kidName: "",
      dateOfBirth: "",
      grade: undefined as unknown as RegistrationInput["grade"],
      parentName: "",
      parentPhone: "",
      smsConsent: false,
    });
    toast({
      title: "Submission successful",
      description: "Entry saved successfully.",
    });
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          Kids&apos; Raffle Registration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {serverError ? (
          <Alert variant="destructive">
            <AlertTitle>Submission error</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="kidName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Kid Name<span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter kid name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date of Birth<span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Grade<span className="text-destructive"> *</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Parent Name<span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter parent name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Parent Phone<span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="e.g., 01140289944"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Digits only, 10-11 digits. Formats like 011..., 2011..., or 114... are accepted.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smsConsent"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>SMS notification</FormLabel>
                    <FormDescription>
                      I agree to receive an SMS confirmation about this entry.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="text-xs text-muted-foreground">
              * All fields are required. Your information will only be used for this raffle.
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid || isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Entry"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

