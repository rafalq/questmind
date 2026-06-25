import CreateCampaignForm from '@/features/campaign/components/create-campaign-form'

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">
        New Campaign
      </h1>
      <p className="text-text-secondary mb-10">
        Set the stage for your adventure.
      </p>
      <CreateCampaignForm />
    </div>
  )
}
