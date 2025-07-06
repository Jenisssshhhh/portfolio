import client from './sanityClient'

export async function getResearch() {
  return await client.fetch(
    `*[_type == "research"] | order(year desc){
      _id,
      title,
      year,
      description,
      link
    }`
  )
}

export async function getProfile() {
  return await client.fetch(
    `*[_type == "profile"][0]{
      name,
      degree,
      title,
      openToOpportunities
    }`
  )
}

export async function getSkills() {
    return await client.fetch(
      `*[_type == "skill"] | order(_createdAt asc){
        _id,
        name
      }`
    )
  }

  export async function getProjects() {
    return await client.fetch(
      `*[_type == "project"] | order(_createdAt desc){
        _id,
        title,
        description,
        link,
        preview{
          asset->{
            url
          }
        }
      }`
    )
  }

export async function getCurrentlyWorking() {
  return await client.fetch(
    `*[_type == "currentlyWorking"][0]{
      title,
      projectTitle,
      description,
      techs,
      progress,
      excitement
    }`
  );
}
export async function getTimeline() {
  return await client.fetch(
    `*[_type == "timeline"] | order(order asc, year desc){
      _id,
      year,
      title,
      desc
    }`
  );
}